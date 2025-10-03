export enum BillingPlan {
  MONTHLY = 'MONTHLY',
  LIFETIME = 'LIFETIME',
}

export type PlanMode = 'subscription' | 'payment';

export type PlanConfig = {
  priceId: string;
  mode: PlanMode;
};
