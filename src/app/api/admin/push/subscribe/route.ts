import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, jsonServerError } from "@/lib/api";
import { requirePlatformAdmin } from "@/lib/admin-access";
import { isPushConfigured } from "@/lib/seller-push";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(req: Request) {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;
  if (!isPushConfigured()) {
    return jsonError("התראות דחיפה לא מוגדרות בשרת", 503);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    await prisma.masterPushSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      create: {
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
      update: {
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
    });
  } catch (error) {
    return jsonServerError(error, "admin:push-subscribe", {
      publicMessage: "שגיאה בשמירת ההרשמה — נסו שוב",
    });
  }

  return jsonOk({ subscribed: true });
}

export async function DELETE(req: Request) {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const endpoint =
    body && typeof body.endpoint === "string" ? body.endpoint : null;

  if (endpoint) {
    await prisma.masterPushSubscription.deleteMany({ where: { endpoint } });
  } else {
    await prisma.masterPushSubscription.deleteMany();
  }

  return jsonOk({ unsubscribed: true });
}
