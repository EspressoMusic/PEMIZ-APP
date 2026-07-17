import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { isPushConfigured } from "@/lib/seller-push";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  orderIds: z.array(z.string()).min(1).max(20),
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
    `public:orders-push-subscribe:${slug.toLowerCase()}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

  if (!isPushConfigured()) {
    return jsonError("התראות דחיפה לא מוגדרות בשרת", 503);
  }

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const orders = await prisma.order.findMany({
    where: {
      id: { in: parsed.data.orderIds },
      businessId: business.id,
      status: "PENDING",
    },
    select: { id: true },
  });
  if (orders.length === 0) return jsonOk({ subscribed: false });

  try {
    await prisma.$transaction(
      orders.map((order) =>
        prisma.orderPushSubscription.upsert({
          where: {
            orderId_endpoint: {
              orderId: order.id,
              endpoint: parsed.data.endpoint,
            },
          },
          create: {
            orderId: order.id,
            endpoint: parsed.data.endpoint,
            p256dh: parsed.data.keys.p256dh,
            auth: parsed.data.keys.auth,
          },
          update: {
            p256dh: parsed.data.keys.p256dh,
            auth: parsed.data.keys.auth,
          },
        })
      )
    );
  } catch (error) {
    console.error("[public/orders/push/subscribe]", error);
    return jsonError("שגיאה בשמירת ההרשמה — נסו שוב", 500);
  }

  return jsonOk({ subscribed: true });
}
