CREATE TABLE "OrderPushSubscription" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderPushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderPushSubscription_orderId_endpoint_key" ON "OrderPushSubscription"("orderId", "endpoint");
CREATE INDEX "OrderPushSubscription_orderId_idx" ON "OrderPushSubscription"("orderId");

ALTER TABLE "OrderPushSubscription" ADD CONSTRAINT "OrderPushSubscription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderPushSubscription" ENABLE ROW LEVEL SECURITY;
