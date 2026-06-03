-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE IF NOT EXISTS "StoreChatMessage" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StoreChatMessage_businessId_channel_createdAt_idx" ON "StoreChatMessage"("businessId", "channel", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StoreChatMessage_businessId_channel_customerPhone_idx" ON "StoreChatMessage"("businessId", "channel", "customerPhone");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "StoreChatMessage" ADD CONSTRAINT "StoreChatMessage_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
