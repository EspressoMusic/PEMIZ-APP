-- Appointments are confirmed immediately when booked (no seller approval step).
UPDATE "Appointment" SET "status" = 'CONFIRMED' WHERE "status" = 'PENDING';

ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
