import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizeTimeInput } from "@/lib/order-schedule";

const schema = z
  .object({
    enabled: z.boolean(),
    days: z.array(z.number().int().min(0).max(6)),
    blockedDays: z.array(z.number().int().min(0).max(6)).default([]),
    startTime: z.string(),
    endTime: z.string(),
  })
  .superRefine((data, ctx) => {
    const start = normalizeTimeInput(data.startTime);
    const end = normalizeTimeInput(data.endTime);
    if (!start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "שעת התחלה לא תקינה",
        path: ["startTime"],
      });
    }
    if (!end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "שעת סיום לא תקינה",
        path: ["endTime"],
      });
    }
    const openDays = data.days.filter((d) => !data.blockedDays.includes(d));
    if (data.enabled && openDays.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש להשאיר לפחות יום אחד פתוח להזמנות",
        path: ["days"],
      });
    }
  });

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);
  if (user.business.type !== "STORE") {
    return jsonError("הגדרה זמינה רק לחנויות", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return jsonError(first ?? "נתונים לא תקינים");
  }

  const startTime = normalizeTimeInput(parsed.data.startTime)!;
  const endTime = normalizeTimeInput(parsed.data.endTime)!;
  const uniqueDays = [...new Set(parsed.data.days)].sort((a, b) => a - b);
  const uniqueBlocked = [...new Set(parsed.data.blockedDays)].sort(
    (a, b) => a - b
  );
  const scheduleJson = JSON.stringify({
    days: uniqueDays,
    blockedDays: uniqueBlocked,
    startTime,
    endTime,
  });

  try {
    await prisma.business.update({
      where: { id: user.business.id },
      data: {
        orderScheduleEnabled: parsed.data.enabled,
        orderSchedule: parsed.data.enabled ? scheduleJson : null,
      },
    });
  } catch (e) {
    console.error("order-schedule update failed", e);
    return jsonError(
      "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
      500
    );
  }

  return jsonOk({
    enabled: parsed.data.enabled,
    days: uniqueDays,
    blockedDays: uniqueBlocked,
    startTime,
    endTime,
  });
}
