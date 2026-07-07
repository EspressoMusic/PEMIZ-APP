import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { isPushConfigured } from "@/lib/seller-push";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:push-subscribe:${slug.toLowerCase()}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

  if (!isPushConfigured()) {
    return jsonError("התראות דחיפה לא מוגדרות בשרת", 503);
  }

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true, storePanelsVisible: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);
  if (!isStorePanelEnabled(business, "broadcast")) {
    return jsonError("התראות לא זמינות בחנות זו", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    await prisma.customerPushSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      create: {
        businessId: business.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
      update: {
        businessId: business.id,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
    });
  } catch (error) {
    console.error("[public/push/subscribe]", error);
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
    `public:push-unsubscribe:${slug.toLowerCase()}`,
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

  await prisma.customerPushSubscription.deleteMany({
    where: { businessId: business.id, endpoint },
  });

  return jsonOk({ unsubscribed: true });
}
