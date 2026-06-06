CREATE TABLE "SellerPushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SellerPushSubscription_endpoint_key" ON "SellerPushSubscription"("endpoint");
CREATE INDEX "SellerPushSubscription_userId_idx" ON "SellerPushSubscription"("userId");

ALTER TABLE "SellerPushSubscription" ADD CONSTRAINT "SellerPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
