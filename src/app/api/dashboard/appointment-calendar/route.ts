import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import {
  calendarConfigFromBusiness,
  calendarConfigToBusinessData,
} from "@/lib/appointment-calendar-config";
import { regenerateAppointmentCalendar } from "@/lib/appointment-calendar-regenerate";
import { normalizeTimeInput } from "@/lib/order-schedule";
import { effectiveServiceDurationMinutes } from "@/lib/service-duration";

const patchSchema = z.object({
  gapMinutes: z.number().int().min(0).max(180).optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  bookingStart: z.string().optional(),
  bookingEnd: z.string().optional(),
  bookingByDay: z.boolean().optional(),
  regenerate: z.boolean().optional(),
});

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  if (ctx.user.business.type !== "APPOINTMENTS") {
    return jsonError("עסק לא במצב תורים", 400);
  }

  const b = ctx.user.business;
  const products = await prisma.product.findMany({
    where: { businessId: b.id, isActive: true },
    select: { serviceDurationMinutes: true, isActive: true },
  });
  const baseConfig = calendarConfigFromBusiness(b);
  const config = {
    ...baseConfig,
    durationMinutes: effectiveServiceDurationMinutes(
      products,
      baseConfig.durationMinutes
    ),
  };

  const slots = await prisma.appointmentSlot.findMany({
    where: {
      businessId: b.id,
      startAt: { gte: new Date() },
    },
    include: {
      appointments: { where: { status: { not: "CANCELLED" } } },
    },
    orderBy: { startAt: "asc" },
  });

  return jsonOk({
    config,
    orderScheduleEnabled: b.orderScheduleEnabled ?? false,
    slots: slots.map((s) => ({
      id: s.id,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      maxBookings: s.maxBookings,
      appointments: s.appointments,
    })),
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  if (ctx.user.business.type !== "APPOINTMENTS") {
    return jsonError("עסק לא במצב תורים", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const current = calendarConfigFromBusiness(ctx.user.business);
  const merged = {
    ...current,
    ...parsed.data,
  };

  if (
    merged.bookingStart &&
    (!normalizeTimeInput(merged.bookingStart) ||
      !normalizeTimeInput(merged.bookingEnd))
  ) {
    return jsonError("שעות לא תקינות");
  }

  const startM =
    Number(merged.bookingStart.split(":")[0]) * 60 +
    Number(merged.bookingStart.split(":")[1]);
  const endM =
    Number(merged.bookingEnd.split(":")[0]) * 60 +
    Number(merged.bookingEnd.split(":")[1]);
  if (endM <= startM) {
    return jsonError("שעת הסיום חייבת להיות אחרי שעת ההתחלה");
  }

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
    data: calendarConfigToBusinessData(merged),
  });

  if (parsed.data.regenerate !== false) {
    await regenerateAppointmentCalendar(updated.id);
  }

  const products = await prisma.product.findMany({
    where: { businessId: updated.id, isActive: true },
    select: { serviceDurationMinutes: true, isActive: true },
  });
  const config = {
    ...calendarConfigFromBusiness(updated),
    durationMinutes: effectiveServiceDurationMinutes(
      products,
      calendarConfigFromBusiness(updated).durationMinutes
    ),
  };

  const slots = await prisma.appointmentSlot.findMany({
    where: {
      businessId: updated.id,
      startAt: { gte: new Date() },
    },
    include: {
      appointments: { where: { status: { not: "CANCELLED" } } },
    },
    orderBy: { startAt: "asc" },
  });

  return jsonOk({
    config,
    slots: slots.map((s) => ({
      id: s.id,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      maxBookings: s.maxBookings,
      appointments: s.appointments,
    })),
  });
}
