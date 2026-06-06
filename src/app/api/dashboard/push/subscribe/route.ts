import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { isPushConfigured } from "@/lib/seller-push";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(req: Request) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  if (!isPushConfigured()) {
    return jsonError("התראות דחיפה לא מוגדרות בשרת", 503);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const userAgent = req.headers.get("user-agent") ?? undefined;

  await prisma.sellerPushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      userId: ctx.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    },
    update: {
      userId: ctx.user.id,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    },
  });

  return jsonOk({ subscribed: true });
}

export async function DELETE(req: Request) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const endpoint =
    body && typeof body.endpoint === "string" ? body.endpoint : null;

  if (endpoint) {
    await prisma.sellerPushSubscription.deleteMany({
      where: { userId: ctx.user.id, endpoint },
    });
  } else {
    await prisma.sellerPushSubscription.deleteMany({
      where: { userId: ctx.user.id },
    });
  }

  return jsonOk({ unsubscribed: true });
}
