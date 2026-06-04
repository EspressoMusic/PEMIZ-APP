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

const statusSchema = z.object({
  appointmentId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const appt = await prisma.appointment.findFirst({
    where: { id: parsed.data.appointmentId, businessId: ctx.user.business.id },
  });
  if (!appt) return jsonError("תור לא נמצא", 404);

  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: { status: parsed.data.status },
  });
  return jsonOk({ appointment: updated });
}
