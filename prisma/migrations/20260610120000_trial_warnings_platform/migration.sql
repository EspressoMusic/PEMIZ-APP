-- AlterTable
ALTER TABLE "PlatformConfig" ADD COLUMN "trialClosureEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PlatformConfig" ADD COLUMN "trialWarningEmailsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "trialWarned7dAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN "trialWarned3dAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN "trialWarned1dAt" TIMESTAMP(3);
