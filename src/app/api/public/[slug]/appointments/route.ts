import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { slotRemaining } from "@/lib/business";
import {
  INVALID_PHONE_MESSAGE_HE,
  normalizePhone,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { customerPhoneSchema } from "@/lib/validation/schemas";
import {
  canCustomerCancelAppointment,
  parseAppointmentCancelPolicy,
} from "@/lib/appointment-cancel-policy";
import { parseServiceFromNotes } from "@/lib/customer-appointment-history";

const postSchema = z.object({
  slotId: z.string(),
  customerName: z.string().min(2).max(80),
  customerPhone: customerPhoneSchema,
  serviceName: z.string().min(1).max(120),
  notes: z.string().max(500).optional(),
});

const patchSchema = z.object({
  appointmentId: z.string(),
  customerPhone: customerPhoneSchema,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const phone = parseIsraeliMobilePhone(
    new URL(req.url).searchParams.get("phone") ?? ""
  );
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (business.type !== "APPOINTMENTS") return jsonError("עסק זה אינו מקבל תורים", 400);

  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      customerPhone: { contains: phone.slice(-9) },
    },
    include: { slot: true },
    orderBy: { createdAt: "desc" },
  });

  const filtered = appointments.filter(
    (a) => normalizePhone(a.customerPhone) === phone
  );

  return jsonOk({
    appointments: filtered.map((a) => ({
      id: a.id,
      slotId: a.slotId,
      startAt: a.slot.startAt.toISOString(),
      endAt: a.slot.endAt.toISOString(),
      serviceName: parseServiceFromNotes(a.notes),
      customerName: a.customerName,
      customerPhone: a.customerPhone,
      notes: a.notes,
      status: a.status,
      bookedAt: a.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("This business is currently unavailable.", 403);
  if (business.type !== "APPOINTMENTS") return jsonError("עסק זה אינו מקבל תורים", 400);

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const slot = await prisma.appointmentSlot.findFirst({
    where: { id: parsed.data.slotId, businessId: business.id },
    include: {
      appointments: { where: { status: { not: "CANCELLED" } } },
    },
  });
  if (!slot) return jsonError("משבצת לא נמצאה", 404);
  if (slot.startAt < new Date()) return jsonError("משבצת בעבר");
  if (slotRemaining(slot) <= 0) return jsonError("משבצת מלאה");

  const prefix = business.storeLocale === "en" ? "Service:" : "שירות:";
  const noteParts = [`${prefix} ${parsed.data.serviceName.trim()}`];
  const extra = parsed.data.notes?.trim();
  if (extra) noteParts.push(extra);

  const appointment = await prisma.appointment.create({
    data: {
      businessId: business.id,
      slotId: slot.id,
      customerName: parsed.data.customerName,
      customerPhone: parseIsraeliMobilePhone(parsed.data.customerPhone)!,
      notes: noteParts.join("\n"),
      status: "CONFIRMED",
    },
    include: { slot: true },
  });

  return jsonOk({
    appointmentId: appointment.id,
    appointment: {
      id: appointment.id,
      slotId: appointment.slotId,
      startAt: appointment.slot.startAt.toISOString(),
      endAt: appointment.slot.endAt.toISOString(),
      serviceName: parsed.data.serviceName,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      notes: appointment.notes,
      status: appointment.status,
      bookedAt: appointment.createdAt.toISOString(),
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("This business is currently unavailable.", 403);
  if (business.type !== "APPOINTMENTS") return jsonError("עסק זה אינו מקבל תורים", 400);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = parseIsraeliMobilePhone(parsed.data.customerPhone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);
  const appt = await prisma.appointment.findFirst({
    where: {
      id: parsed.data.appointmentId,
      businessId: business.id,
    },
    include: { slot: true },
  });
  if (!appt) return jsonError("תור לא נמצא", 404);
  if (parseIsraeliMobilePhone(appt.customerPhone) !== phone) {
    return jsonError("אין הרשאה לבטל תור זה", 403);
  }

  const cancelPolicy = parseAppointmentCancelPolicy(business.storeTerms);
  if (
    !canCustomerCancelAppointment(
      appt.slot.startAt.toISOString(),
      cancelPolicy,
      appt.status
    )
  ) {
    return jsonError("לא ניתן לבטל את התור לפי מדיניות החנות", 403);
  }

  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: { status: "CANCELLED" },
    include: { slot: true },
  });

  return jsonOk({
    appointment: {
      id: updated.id,
      slotId: updated.slotId,
      startAt: updated.slot.startAt.toISOString(),
      endAt: updated.slot.endAt.toISOString(),
      serviceName: parseServiceFromNotes(updated.notes),
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      notes: updated.notes,
      status: updated.status,
      bookedAt: updated.createdAt.toISOString(),
    },
  });
}
