-- DropForeignKey
ALTER TABLE "OtpCode" DROP CONSTRAINT IF EXISTS "OtpCode_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "OtpCode";
DROP TABLE IF EXISTS "PublicPhoneOtp";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "phoneVerified";
