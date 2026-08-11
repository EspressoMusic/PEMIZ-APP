CREATE TABLE "MasterLoginAttempt" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "MasterLoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MasterLoginAttempt_at_idx" ON "MasterLoginAttempt"("at");

ALTER TABLE "MasterLoginAttempt" ENABLE ROW LEVEL SECURITY;
