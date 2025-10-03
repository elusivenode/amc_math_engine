import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MembershipPlan, MembershipStatus, type User } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { BillingPlan, type PlanConfig } from './billing.types';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly successUrl: string;
  private readonly cancelUrl: string;
  private readonly planConfig: Record<BillingPlan, PlanConfig>;
  private readonly priceToPlan: Map<string, BillingPlan>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured.');
    }

    this.stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
    }
    this.webhookSecret = webhookSecret;

    const successUrl = this.configService.get<string>('STRIPE_CHECKOUT_SUCCESS_URL');
    const cancelUrl = this.configService.get<string>('STRIPE_CHECKOUT_CANCEL_URL');
    const fallbackOrigin = this.configService
      .get<string>('FRONTEND_ORIGIN')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)?.[0];
    const fallbackBase = fallbackOrigin ?? 'http://localhost:5173';
    this.successUrl = successUrl ?? `${fallbackBase}/login?checkout=success`;
    this.cancelUrl = cancelUrl ?? `${fallbackBase}/login?checkout=cancel`;

    const monthlyPriceId = this.configService.get<string>('STRIPE_PRICE_ID_MONTHLY');
    const lifetimePriceId = this.configService.get<string>('STRIPE_PRICE_ID_LIFETIME');

    if (!monthlyPriceId || !lifetimePriceId) {
      throw new Error('Stripe price IDs are not fully configured.');
    }

    this.planConfig = {
      [BillingPlan.MONTHLY]: {
        priceId: monthlyPriceId,
        mode: 'subscription',
      },
      [BillingPlan.LIFETIME]: {
        priceId: lifetimePriceId,
        mode: 'payment',
      },
    };

    this.priceToPlan = new Map<string, BillingPlan>([
      [monthlyPriceId, BillingPlan.MONTHLY],
      [lifetimePriceId, BillingPlan.LIFETIME],
    ]);
  }

  async createCheckoutSession(userId: string, plan: BillingPlan): Promise<string> {
    const config = this.planConfig[plan];
    if (!config) {
      throw new BadRequestException('Unsupported billing plan requested.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found when creating Stripe checkout session.');
    }

    const ensuredUser = await this.ensureCustomer(user);

    const session = await this.stripe.checkout.sessions.create({
      mode: config.mode,
      customer: ensuredUser.stripeCustomerId ?? undefined,
      line_items: [
        {
          price: config.priceId,
          quantity: 1,
        },
      ],
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
      metadata: {
        userId: ensuredUser.id,
        plan,
      },
      subscription_data:
        config.mode === 'subscription'
          ? {
              metadata: {
                userId: ensuredUser.id,
                plan,
              },
            }
          : undefined,
      payment_intent_data:
        config.mode === 'payment'
          ? {
              metadata: {
                userId: ensuredUser.id,
                plan,
              },
            }
          : undefined,
    });

    if (!session.url) {
      throw new InternalServerErrorException('Stripe did not return a checkout URL.');
    }

    return session.url;
  }

  async handleWebhook(rawBody: Buffer | string | undefined, signature?: string): Promise<void> {
    if (!rawBody) {
      throw new BadRequestException('Missing raw body for Stripe webhook validation.');
    }

    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header.');
    }

    const payload = typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (error) {
      this.logger.warn(`Stripe webhook signature verification failed: ${(error as Error).message}`);
      throw new BadRequestException('Invalid Stripe webhook signature.');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      default:
        this.logger.debug(`Ignoring unsupported Stripe event type: ${event.type}`);
    }
  }

  private async ensureCustomer(user: User): Promise<User> {
    if (user.stripeCustomerId) {
      return user;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.displayName ?? undefined,
      metadata: {
        userId: user.id,
      },
    });

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customer.id,
      },
    });
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const plan = this.parsePlan(session.metadata?.plan);

    if (!userId || !plan) {
      this.logger.warn('Checkout session completed without user metadata.');
      return;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`No user found for checkout session metadata userId=${userId}`);
      return;
    }

    const customerId = this.extractId(session.customer) ?? user.stripeCustomerId ?? undefined;

    if (customerId && user.stripeCustomerId !== customerId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    if (plan === BillingPlan.MONTHLY) {
      if (typeof session.subscription === 'string') {
        const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
        await this.upsertSubscription(subscription);
      } else {
        this.logger.warn('Expected subscription ID on monthly checkout session.');
      }
      return;
    }

    // Lifetime purchase flow
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipPlan: MembershipPlan.LIFETIME,
        membershipStatus: MembershipStatus.ACTIVE,
        membershipActivatedAt: user.membershipActivatedAt ?? new Date(),
        membershipExpiresAt: null,
        stripeSubscriptionId: null,
        stripePriceId: this.planConfig[plan].priceId,
      },
    });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = this.extractId(invoice.subscription);
    if (!subscriptionId) {
      this.logger.debug('Invoice payment succeeded without subscription reference.');
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.upsertSubscription(subscription);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    await this.upsertSubscription(subscription);
  }

  private async upsertSubscription(subscription: Stripe.Subscription): Promise<void> {
    const customerId = this.extractId(subscription.customer);
    if (!customerId) {
      this.logger.warn('Subscription update missing customer reference.');
      return;
    }

    const user = await this.prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
    if (!user) {
      this.logger.warn(`No user mapped to Stripe customer ${customerId}`);
      return;
    }

    const priceId = subscription.items.data[0]?.price?.id ?? undefined;
    const planFromPrice = priceId ? this.priceToPlan.get(priceId) : undefined;
    const membershipPlan = planFromPrice
      ? this.toMembershipPlan(planFromPrice)
      : user.membershipPlan ?? MembershipPlan.MONTHLY;
    const membershipStatus = this.mapSubscriptionStatus(subscription.status);
    const membershipActivatedAt =
      user.membershipActivatedAt ?? (membershipStatus === MembershipStatus.ACTIVE ? new Date() : null);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipPlan,
        membershipStatus,
        membershipActivatedAt,
        membershipExpiresAt: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : user.membershipExpiresAt,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId ?? user.stripePriceId,
      },
    });
  }

  private parsePlan(value?: string | null): BillingPlan | null {
    if (!value) return null;
    return Object.values(BillingPlan).includes(value as BillingPlan) ? (value as BillingPlan) : null;
  }

  private extractId(
    value:
      | string
      | Stripe.Customer
      | Stripe.DeletedCustomer
      | Stripe.Subscription
      | null
      | undefined,
  ): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if ('id' in value) return value.id;
    return undefined;
  }

  private toMembershipPlan(plan: BillingPlan): MembershipPlan {
    switch (plan) {
      case BillingPlan.MONTHLY:
        return MembershipPlan.MONTHLY;
      case BillingPlan.LIFETIME:
        return MembershipPlan.LIFETIME;
      default:
        return MembershipPlan.NONE;
    }
  }

  private mapSubscriptionStatus(status: Stripe.Subscription.Status): MembershipStatus {
    switch (status) {
      case 'active':
      case 'trialing':
        return MembershipStatus.ACTIVE;
      case 'past_due':
        return MembershipStatus.PAST_DUE;
      case 'canceled':
      case 'unpaid':
        return MembershipStatus.CANCELED;
      case 'incomplete':
      case 'incomplete_expired':
      case 'paused':
      default:
        return MembershipStatus.PENDING;
    }
  }
}
