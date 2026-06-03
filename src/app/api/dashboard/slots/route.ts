import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  maxBookings: z.number().int().min(1).max(20).default(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business || user.business.type !== "APPOINTMENTS") {
    return jsonError("עסק לא במצב תורים", 400);
  }

  const slots = await prisma.appointmentSlot.findMany({
    where: { businessId: user.business.id },
    include: {
      appointments: { where: { status: { not: "CANCELLED" } } },
    },
    orderBy: { startAt: "asc" },
  });
  return jsonOk({ slots });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business || user.business.type !== "APPOINTMENTS") {
    return jsonError("עסק לא במצב תורים", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (endAt <= startAt) return jsonError("שעת סיום חייבת להיות אחרי התחלה");

  const slot = await prisma.appointmentSlot.create({
    data: {
      businessId: user.business.id,
      startAt,
      endAt,
      maxBookings: parsed.data.maxBookings,
    },
  });
  return jsonOk({ slot });
}
