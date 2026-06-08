import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { slotRemaining } from "@/lib/business";
import { normalizePhone } from "@/lib/phone";
import {
  SELLER_SELF_BOOKING_NOTE,
  SELLER_WALK_IN_PHONE,
} from "@/lib/seller-appointment-booking";
import { z } from "zod";

const postSchema = z.object({
  slotId: z.string(),
  customerName: z.string().min(1).max(80).optional(),
  customerPhone: z.string().min(9).max(20).optional(),
  serviceName: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  if (ctx.user.business.type !== "APPOINTMENTS") {
    return jsonError("עסק לא במצב תורים", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const business = ctx.user.business;
  const slot = await prisma.appointmentSlot.findFirst({
    where: { id: parsed.data.slotId, businessId: business.id },
    include: {
      appointments: { where: { status: { not: "CANCELLED" } } },
    },
  });
  if (!slot) return jsonError("משבצת לא נמצאה", 404);
  if (slot.startAt < new Date()) return jsonError("משבצת בעבר");
  if (slotRemaining(slot) <= 0) return jsonError("משבצת מלאה");
  if (slot.appointments.length > 0) {
    return jsonError("למשבצת זו כבר יש תור");
  }

  const customerName =
    parsed.data.customerName?.trim() ||
    (business.storeLocale === "en" ? "Seller booking" : "שיבוץ מוכר");
  const customerPhone = normalizePhone(
    parsed.data.customerPhone ?? SELLER_WALK_IN_PHONE
  );
  const noteParts: string[] = [SELLER_SELF_BOOKING_NOTE];
  const serviceName = parsed.data.serviceName?.trim();
  if (serviceName) {
    const prefix = business.storeLocale === "en" ? "Service:" : "שירות:";
    noteParts.push(`${prefix} ${serviceName}`);
  }

  const appointment = await prisma.appointment.create({
    data: {
      businessId: business.id,
      slotId: slot.id,
      customerName,
      customerPhone,
      notes: noteParts.join("\n"),
      status: "CONFIRMED",
    },
    include: { slot: true },
  });

  return jsonOk({ appointment });
}

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
