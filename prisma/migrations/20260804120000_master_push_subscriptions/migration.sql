CREATE TABLE "MasterPushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterPushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MasterPushSubscription_endpoint_key" ON "MasterPushSubscription"("endpoint");

ALTER TABLE "MasterPushSubscription" ENABLE ROW LEVEL SECURITY;
