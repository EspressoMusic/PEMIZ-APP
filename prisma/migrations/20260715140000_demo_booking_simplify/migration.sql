DROP INDEX IF EXISTS "DemoBooking_scheduledAt_key";
DROP INDEX IF EXISTS "DemoBooking_scheduledAt_idx";
ALTER TABLE "DemoBooking" DROP COLUMN IF EXISTS "scheduledAt";
ALTER TABLE "DemoBooking" DROP COLUMN IF EXISTS "meetUrl";
CREATE INDEX IF NOT EXISTS "DemoBooking_createdAt_idx" ON "DemoBooking"("createdAt");
