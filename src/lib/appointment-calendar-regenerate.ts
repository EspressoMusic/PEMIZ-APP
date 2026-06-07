import { prisma } from "@/lib/prisma";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";
import { buildSlotsForRange } from "@/lib/appointment-slot-generator";
import { effectiveServiceDurationMinutes } from "@/lib/service-duration";

export async function regenerateAppointmentCalendar(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      products: {
        where: { isActive: true },
        select: { serviceDurationMinutes: true, isActive: true },
      },
    },
  });
  if (!business || business.type !== "APPOINTMENTS") return;

  const baseConfig = calendarConfigFromBusiness(business);
  const config = {
    ...baseConfig,
    durationMinutes: effectiveServiceDurationMinutes(
      business.products,
      baseConfig.durationMinutes
    ),
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

  const bookedTimes = new Set(
    existing
      .filter((s) => s.appointments.length > 0)
      .map((s) => s.startAt.getTime())
  );
  const existingTimes = new Set(existing.map((s) => s.startAt.getTime()));

  const emptyFuture = existing.filter((s) => s.appointments.length === 0);
  if (emptyFuture.length > 0) {
    await prisma.appointmentSlot.deleteMany({
      where: { id: { in: emptyFuture.map((s) => s.id) } },
    });
  }

  const toCreate = planned.filter((slot) => {
    const t = slot.startAt.getTime();
    return !existingTimes.has(t) && !bookedTimes.has(t);
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
