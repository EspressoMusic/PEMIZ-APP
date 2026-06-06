ALTER TABLE "Business"
  ADD COLUMN "sellerAlertsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sellerAlertOnInquiry" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sellerAlertOnChat" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sellerAlertOnNewOrder" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sellerAlertOnLowStock" BOOLEAN NOT NULL DEFAULT true;
