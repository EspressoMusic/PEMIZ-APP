-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "customerResolution" TEXT,
ADD COLUMN "customerResolutionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StoreChatMessage" ADD COLUMN "customerResolution" TEXT,
ADD COLUMN "customerResolutionAt" TIMESTAMP(3);
