ALTER TABLE "Business" ALTER COLUMN "storeLocale" SET DEFAULT 'en';

ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionStripeCustomerId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionStripeSubscriptionId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionCurrentPeriodStart" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionCurrentPeriodEnd" TIMESTAMP(3);
