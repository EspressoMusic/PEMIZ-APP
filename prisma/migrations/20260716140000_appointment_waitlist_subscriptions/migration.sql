CREATE TABLE "AppointmentWaitlistSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentWaitlistSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppointmentWaitlistSubscription_endpoint_key" ON "AppointmentWaitlistSubscription"("endpoint");
CREATE INDEX "AppointmentWaitlistSubscription_businessId_idx" ON "AppointmentWaitlistSubscription"("businessId");

ALTER TABLE "AppointmentWaitlistSubscription" ADD CONSTRAINT "AppointmentWaitlistSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppointmentWaitlistSubscription" ENABLE ROW LEVEL SECURITY;
