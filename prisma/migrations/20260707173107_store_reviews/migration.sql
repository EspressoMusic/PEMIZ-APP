CREATE TABLE "StoreReview" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoreReview_businessId_customerPhone_key" ON "StoreReview"("businessId", "customerPhone");
CREATE INDEX "StoreReview_businessId_createdAt_idx" ON "StoreReview"("businessId", "createdAt");

ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
