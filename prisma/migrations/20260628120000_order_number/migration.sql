-- AlterTable
ALTER TABLE "Business" ADD COLUMN "nextOrderNumber" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

-- Backfill sequential order numbers per business (oldest first)
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "businessId"
      ORDER BY "createdAt", id
    ) AS rn
  FROM "Order"
)
UPDATE "Order" o
SET "orderNumber" = n.rn
FROM numbered n
WHERE o.id = n.id;

-- Align counters for businesses that already have orders
UPDATE "Business" b
SET "nextOrderNumber" = COALESCE(
  (SELECT MAX("orderNumber") + 1 FROM "Order" WHERE "businessId" = b.id),
  1
);

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_businessId_orderNumber_key" ON "Order"("businessId", "orderNumber");
