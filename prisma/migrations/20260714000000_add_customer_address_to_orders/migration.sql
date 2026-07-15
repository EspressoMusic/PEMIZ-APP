-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerAddressLat" DOUBLE PRECISION,
ADD COLUMN     "customerAddressLng" DOUBLE PRECISION,
ADD COLUMN     "customerAddressPlaceId" TEXT;
