-- Up to 4 images per product; backfill from legacy imageUrl
ALTER TABLE "Product" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Product"
SET "imageUrls" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL AND TRIM("imageUrl") <> '';
