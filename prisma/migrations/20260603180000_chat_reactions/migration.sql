-- AlterTable
ALTER TABLE "StoreChatMessage" ADD COLUMN IF NOT EXISTS "replyToId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StoreChatMessage_replyToId_idx" ON "StoreChatMessage"("replyToId");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "StoreChatMessage" ADD CONSTRAINT "StoreChatMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "StoreChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "StoreChatMessageLike" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreChatMessageLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StoreChatMessageLike_messageId_customerPhone_key" ON "StoreChatMessageLike"("messageId", "customerPhone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StoreChatMessageLike_messageId_idx" ON "StoreChatMessageLike"("messageId");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "StoreChatMessageLike" ADD CONSTRAINT "StoreChatMessageLike_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "StoreChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
