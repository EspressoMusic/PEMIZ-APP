import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { formatPhoneForWhatsApp } from "@/lib/phone";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { sendSellerWhatsAppTest } from "@/lib/whatsapp-seller-notify";

const patchSchema = z.object({
  enabled: z.boolean(),
  phone: z.string().min(9).max(20),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);
  if (user.business.type !== "STORE") {
    return jsonError("הגדרה זמינה רק לחנויות", 400);
  }

  const b = user.business;
  return jsonOk({
    enabled: b.whatsappNotifyEnabled ?? false,
    phone: b.whatsappNotifyPhone ?? user.phone ?? "",
    ownerPhone: user.phone ?? "",
    serverConfigured: isWhatsAppConfigured(),
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);
  if (user.business.type !== "STORE") {
    return jsonError("הגדרה זמינה רק לחנויות", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const waPhone = formatPhoneForWhatsApp(parsed.data.phone);
  if (!waPhone) {
    return jsonError("מספר וואטסאפ לא תקין (לדוגמה 050-1234567)");
  }

  try {
    await prisma.business.update({
      where: { id: user.business.id },
      data: {
        whatsappNotifyEnabled: parsed.data.enabled,
        whatsappNotifyPhone: parsed.data.phone.trim(),
      },
    });
  } catch (e) {
    console.error("whatsapp settings update failed", e);
    return jsonError(
      "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
      500
    );
  }

  return jsonOk({
    enabled: parsed.data.enabled,
    phone: parsed.data.phone.trim(),
    serverConfigured: isWhatsAppConfigured(),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);
  if (user.business.type !== "STORE") {
    return jsonError("הגדרה זמינה רק לחנויות", 400);
  }

  const url = new URL(req.url);
  if (url.searchParams.get("action") !== "test") {
    return jsonError("פעולה לא נתמכת", 400);
  }

  const b = user.business;
  const result = await sendSellerWhatsAppTest({
    id: b.id,
    name: b.name,
    whatsappNotifyEnabled: b.whatsappNotifyEnabled,
    whatsappNotifyPhone: b.whatsappNotifyPhone,
  });

  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ message: result.message });
}
