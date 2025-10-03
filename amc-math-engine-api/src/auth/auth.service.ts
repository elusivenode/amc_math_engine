import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MembershipPlan, MembershipStatus, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { BillingPlan } from '../billing/billing.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type AuthPayload = {
  token: string;
  user: {
    id: string;
    email: string;
    displayName?: string | null;
  };
};

export type RegisterResult = {
  checkoutUrl: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly billingService: BillingService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const membershipPlan = this.toMembershipPlan(dto.plan);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
        membershipPlan,
        membershipStatus: membershipPlan === MembershipPlan.NONE ? MembershipStatus.NONE : MembershipStatus.PENDING,
      },
    });

    const checkoutUrl = await this.billingService.createCheckoutSession(user.id, dto.plan);

    return { checkoutUrl };
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.membershipPlan !== MembershipPlan.NONE && user.membershipStatus !== MembershipStatus.ACTIVE) {
      throw new UnauthorizedException('Membership is not active. Please complete your payment.');
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthPayload {
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
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
}
