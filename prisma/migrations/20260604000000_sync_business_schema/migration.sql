-- Sync database with prisma/schema.prisma (columns & tables added after initial deploy)

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlatformConfig" (
    "id" TEXT NOT NULL,
    "signupsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- AlterTable Business
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "storeTheme" TEXT NOT NULL DEFAULT 'calm';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "storeLocale" TEXT NOT NULL DEFAULT 'he';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "storePolicy" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "storeTerms" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "storeBroadcast" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "storeBroadcastAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "orderScheduleEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "orderSchedule" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "whatsappNotifyEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "whatsappNotifyPhone" TEXT;

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "salePrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stock" INTEGER;

-- AlterTable Inquiry
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "sellerReply" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "sellerReplyAt" TIMESTAMP(3);

-- CreateTable FaqItem
CREATE TABLE IF NOT EXISTS "FaqItem" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FaqItem_businessId_sortOrder_idx" ON "FaqItem"("businessId", "sortOrder");

DO $$ BEGIN
 ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable StoreDeal
CREATE TABLE IF NOT EXISTS "StoreDeal" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productAId" TEXT,
    "productBId" TEXT,
    "dealPrice" DOUBLE PRECISION NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreDeal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StoreDeal_businessId_idx" ON "StoreDeal"("businessId");

DO $$ BEGIN
 ALTER TABLE "StoreDeal" ADD CONSTRAINT "StoreDeal_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "StoreDeal" ADD CONSTRAINT "StoreDeal_productAId_fkey" FOREIGN KEY ("productAId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "StoreDeal" ADD CONSTRAINT "StoreDeal_productBId_fkey" FOREIGN KEY ("productBId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable StoreDealItem
CREATE TABLE IF NOT EXISTS "StoreDealItem" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoreDealItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StoreDealItem_dealId_productId_key" ON "StoreDealItem"("dealId", "productId");
CREATE INDEX IF NOT EXISTS "StoreDealItem_dealId_idx" ON "StoreDealItem"("dealId");

DO $$ BEGIN
 ALTER TABLE "StoreDealItem" ADD CONSTRAINT "StoreDealItem_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "StoreDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "StoreDealItem" ADD CONSTRAINT "StoreDealItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable DealRedemption
CREATE TABLE IF NOT EXISTS "DealRedemption" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DealRedemption_dealId_customerPhone_key" ON "DealRedemption"("dealId", "customerPhone");

DO $$ BEGIN
 ALTER TABLE "DealRedemption" ADD CONSTRAINT "DealRedemption_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "StoreDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
