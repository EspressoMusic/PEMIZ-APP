ALTER TABLE "StoreDeal" ADD COLUMN IF NOT EXISTS "maxRedemptionsPerCustomer" INTEGER NOT NULL DEFAULT 1;

DROP INDEX IF EXISTS "DealRedemption_dealId_customerPhone_key";

CREATE INDEX IF NOT EXISTS "DealRedemption_dealId_customerPhone_idx"
  ON "DealRedemption"("dealId", "customerPhone");
