-- CreateEnum
CREATE TYPE "public"."MembershipPlan" AS ENUM ('NONE', 'MONTHLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "public"."MembershipStatus" AS ENUM ('NONE', 'PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."User"
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "stripePriceId" TEXT,
  ADD COLUMN "membershipPlan" "public"."MembershipPlan" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "membershipStatus" "public"."MembershipStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "membershipActivatedAt" TIMESTAMP(3),
  ADD COLUMN "membershipExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "public"."User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "public"."User"("stripeSubscriptionId");
