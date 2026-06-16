import { prisma } from "@/lib/prisma";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";
import { buildSlotsForRange } from "@/lib/appointment-slot-generator";
import { isScheduleLikeBusinessType } from "@/lib/types";

export async function regenerateAppointmentCalendar(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business || !isScheduleLikeBusinessType(business.type)) return;

  const baseConfig = calendarConfigFromBusiness(business);
  const config = {
    ...baseConfig,
    bookingByDay: business.appointmentBookingByDay ?? false,
  };

  const now = new Date();
  const planned = buildSlotsForRange(
    config,
    business.orderScheduleEnabled ?? false,
    business.orderSchedule ?? null,
    8,
    now
  );

  const existing = await prisma.appointmentSlot.findMany({
    where: { businessId, startAt: { gte: now } },
    include: {
      appointments: { where: { status: { not: "CANCELLED" } } },
    },
  });

  const bookedSlots = existing.filter((s) => s.appointments.length > 0);
  const bookedTimes = new Set(bookedSlots.map((s) => s.startAt.getTime()));

  const emptyFuture = existing.filter((s) => s.appointments.length === 0);
  if (emptyFuture.length > 0) {
    await prisma.appointmentSlot.deleteMany({
      where: { id: { in: emptyFuture.map((s) => s.id) } },
    });
  }

  const remainingTimes = bookedTimes;

  const toCreate = planned.filter((slot) => {
    const t = slot.startAt.getTime();
    return !remainingTimes.has(t);
  });

  if (toCreate.length > 0) {
    await prisma.appointmentSlot.createMany({
      data: toCreate.map((slot) => ({
        businessId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        maxBookings: slot.maxBookings,
      })),
    });
  }
}
