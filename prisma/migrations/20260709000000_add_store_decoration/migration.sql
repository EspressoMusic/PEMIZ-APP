-- Add an optional decorative overlay (e.g. floral border) layered on top of the store theme
ALTER TABLE "Business" ADD COLUMN "storeDecoration" TEXT NOT NULL DEFAULT 'none';
