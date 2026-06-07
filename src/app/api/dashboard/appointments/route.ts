import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { z } from "zod";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const appointments = await prisma.appointment.findMany({
    where: { businessId: ctx.user.business.id },
    include: { slot: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ appointments });
}

const patchSchema = z
  .object({
    appointmentId: z.string(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
    hide: z.literal(true).optional(),
  })
  .refine((data) => data.status !== undefined || data.hide === true, {
    message: "Missing update",
  });

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const appt = await prisma.appointment.findFirst({
    where: { id: parsed.data.appointmentId, businessId: ctx.user.business.id },
  });
  if (!appt) return jsonError("תור לא נמצא", 404);

  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: {
      ...(parsed.data.status !== undefined
        ? { status: parsed.data.status }
        : {}),
      ...(parsed.data.hide === true ? { sellerHiddenAt: new Date() } : {}),
    },
    include: { slot: true },
  });
  return jsonOk({ appointment: updated });
}
