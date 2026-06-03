import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  enabled: z.boolean(),
  days: z.array(z.number().int().min(0).max(6)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);
  if (user.business.type !== "STORE") {
    return jsonError("הגדרה זמינה רק לחנויות", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const uniqueDays = [...new Set(parsed.data.days)].sort((a, b) => a - b);
  const scheduleJson = JSON.stringify({
    days: uniqueDays,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
  });

  await prisma.business.update({
    where: { id: user.business.id },
    data: {
      orderScheduleEnabled: parsed.data.enabled,
      orderSchedule: parsed.data.enabled ? scheduleJson : null,
    },
  });

  return jsonOk({
    enabled: parsed.data.enabled,
    days: uniqueDays,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
  });
}
