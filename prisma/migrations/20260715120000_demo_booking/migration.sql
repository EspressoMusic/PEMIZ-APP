CREATE TABLE "DemoBooking" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "meetUrl" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DemoBooking_scheduledAt_key" ON "DemoBooking"("scheduledAt");
CREATE INDEX "DemoBooking_scheduledAt_idx" ON "DemoBooking"("scheduledAt");
