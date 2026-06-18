-- Provider-agnostic subscription billing IDs (Paddle default, Stripe optional).

ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionBillingProvider" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionExternalCustomerId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "subscriptionExternalSubscriptionId" TEXT;

UPDATE "Business"
SET
  "subscriptionBillingProvider" = 'stripe',
  "subscriptionExternalCustomerId" = "subscriptionStripeCustomerId",
  "subscriptionExternalSubscriptionId" = "subscriptionStripeSubscriptionId"
WHERE
  "subscriptionStripeSubscriptionId" IS NOT NULL
  AND "subscriptionExternalSubscriptionId" IS NULL;
