import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireCatalogOwner } from "@/lib/dashboard-catalog-auth";
import { regenerateAppointmentCalendar } from "@/lib/appointment-calendar-regenerate";
import {
  defaultDaySlots,
  normalizeTimeInput,
  orderScheduleToJson,
  scheduleFromDaySlots,
  type OrderDaySlot,
} from "@/lib/order-schedule";

const daySlotSchema = z.object({
  day: z.number().int().min(0).max(6),
  open: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
});

const schema = z
  .object({
    enabled: z.boolean(),
    daySlots: z.array(daySlotSchema).optional(),
    days: z.array(z.number().int().min(0).max(6)).optional(),
    blockedDays: z.array(z.number().int().min(0).max(6)).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.enabled) return;

    const slots: OrderDaySlot[] = data.daySlots?.length
      ? [...data.daySlots].sort((a, b) => a.day - b.day)
      : defaultDaySlots();

    const open = slots.filter((s) => s.open);
    if (open.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש להשאיר לפחות יום אחד פתוח להזמנות",
        path: ["daySlots"],
      });
    }

    for (const slot of open) {
      if (!normalizeTimeInput(slot.startTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "שעת התחלה לא תקינה",
          path: ["daySlots"],
        });
      }
      if (!normalizeTimeInput(slot.endTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "שעת סיום לא תקינה",
          path: ["daySlots"],
        });
      }
    }
  });

function normalizeSlotsFromBody(data: z.infer<typeof schema>): OrderDaySlot[] {
  if (data.daySlots?.length) {
    return [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const found = data.daySlots!.find((s) => s.day === day);
      const start = normalizeTimeInput(found?.startTime ?? "") ?? "08:00";
      const end = normalizeTimeInput(found?.endTime ?? "") ?? "20:00";
      return {
        day,
        open: found?.open ?? false,
        startTime: start,
        endTime: end,
      };
    });
  }
  return defaultDaySlots();
}

export async function PATCH(req: Request) {
  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return jsonError(first ?? "נתונים לא תקינים");
  }

  const daySlots = parsed.data.enabled
    ? normalizeSlotsFromBody(parsed.data)
    : defaultDaySlots();
  const scheduleJson = parsed.data.enabled ? orderScheduleToJson(daySlots) : null;
  const summary = scheduleFromDaySlots(daySlots);

  try {
    const updated = await prisma.business.update({
      where: { id: ctx.user.business.id },
      data: {
        orderScheduleEnabled: parsed.data.enabled,
        orderSchedule: scheduleJson,
      },
    });
    if (updated.type === "APPOINTMENTS") {
      await regenerateAppointmentCalendar(updated.id);
    }
  } catch (e) {
    console.error("order-schedule update failed", e);
    return jsonError(
      "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
      500
    );
  }

  return jsonOk({
    enabled: parsed.data.enabled,
    daySlots: summary.daySlots,
    days: summary.days,
    blockedDays: summary.blockedDays,
    startTime: summary.startTime,
    endTime: summary.endTime,
  });
}
