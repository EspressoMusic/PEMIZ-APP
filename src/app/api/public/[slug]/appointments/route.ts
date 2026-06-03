import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { slotRemaining } from "@/lib/business";

const schema = z.object({
  slotId: z.string(),
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().min(9).max(20),
  notes: z.string().max(500).optional(),
});

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
  const parsed = schema.safeParse(body);
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

  const appointment = await prisma.appointment.create({
    data: {
      businessId: business.id,
      slotId: slot.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      notes: parsed.data.notes,
    },
  });

  return jsonOk({ appointmentId: appointment.id });
}
