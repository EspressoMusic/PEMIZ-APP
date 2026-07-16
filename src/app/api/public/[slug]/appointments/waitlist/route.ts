import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { parseIsraeliMobilePhone, INVALID_PHONE_MESSAGE_HE } from "@/lib/phone";

const postSchema = z.object({
  endpoint: z.string().url(),
  phone: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:appointment-waitlist:post:${slug.toLowerCase()}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true, type: true, storePanelsVisible: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);
  if (business.type !== "APPOINTMENTS" && business.type !== "RENTAL") {
    return jsonError("עסק זה אינו מקבל תורים", 400);
  }
  if (!isStorePanelEnabled(business, "broadcast")) {
    return jsonError("התראות לא זמינות בחנות זו", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = parseIsraeliMobilePhone(parsed.data.phone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const subscription = await prisma.customerPushSubscription.findUnique({
    where: { endpoint: parsed.data.endpoint },
  });
  if (!subscription || subscription.businessId !== business.id) {
    return jsonError("יש להפעיל התראות דחיפה תחילה", 400);
  }

  try {
    await prisma.appointmentWaitlistSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      create: {
        businessId: business.id,
        endpoint: parsed.data.endpoint,
        customerPhone: phone,
      },
      update: {
        businessId: business.id,
        customerPhone: phone,
      },
    });
  } catch (error) {
    console.error("[public/appointments/waitlist]", error);
    return jsonError("שגיאה בשמירת ההרשמה — נסו שוב", 500);
  }

  return jsonOk({ subscribed: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:appointment-waitlist:delete:${slug.toLowerCase()}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);

  const body = await req.json().catch(() => null);
  const endpoint =
    body && typeof body.endpoint === "string" ? body.endpoint : null;
  if (!endpoint) return jsonError("נתונים לא תקינים");

  await prisma.appointmentWaitlistSubscription.deleteMany({
    where: { businessId: business.id, endpoint },
  });

  return jsonOk({ unsubscribed: true });
}
