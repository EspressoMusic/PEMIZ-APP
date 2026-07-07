CREATE TABLE "CustomerPushSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerPushSubscription_endpoint_key" ON "CustomerPushSubscription"("endpoint");
CREATE INDEX "CustomerPushSubscription_businessId_idx" ON "CustomerPushSubscription"("businessId");

ALTER TABLE "CustomerPushSubscription" ADD CONSTRAINT "CustomerPushSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
