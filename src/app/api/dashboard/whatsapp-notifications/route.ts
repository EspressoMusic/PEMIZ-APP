import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { formatPhoneForWhatsApp } from "@/lib/phone";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { sendSellerWhatsAppTest } from "@/lib/whatsapp-seller-notify";

const patchSchema = z.object({
  enabled: z.boolean(),
  phone: z.string().min(9).max(20),
});

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  return jsonOk({
    enabled: b.whatsappNotifyEnabled ?? false,
    phone: b.whatsappNotifyPhone ?? ctx.user.phone ?? "",
    ownerPhone: ctx.user.phone ?? "",
    serverConfigured: isWhatsAppConfigured(),
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const waPhone = formatPhoneForWhatsApp(parsed.data.phone);
  if (!waPhone) {
    return jsonError("מספר וואטסאפ לא תקין (לדוגמה 050-1234567)");
  }

  try {
    await prisma.business.update({
      where: { id: ctx.user.business.id },
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
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const url = new URL(req.url);
  if (url.searchParams.get("action") !== "test") {
    return jsonError("פעולה לא נתמכת", 400);
  }

  const b = ctx.user.business;
  const result = await sendSellerWhatsAppTest({
    id: b.id,
    name: b.name,
    whatsappNotifyEnabled: b.whatsappNotifyEnabled,
    whatsappNotifyPhone: b.whatsappNotifyPhone,
  });

  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ message: result.message });
}
