import { prisma } from "@/lib/prisma";
import { isWhatsAppConfigured, sendWhatsAppText } from "@/lib/whatsapp";

type NotifyBusiness = {
  id: string;
  name: string;
  whatsappNotifyEnabled: boolean;
  whatsappNotifyPhone: string | null;
};

function canNotify(business: NotifyBusiness): business is NotifyBusiness & {
  whatsappNotifyPhone: string;
} {
  return (
    business.whatsappNotifyEnabled &&
    Boolean(business.whatsappNotifyPhone?.trim()) &&
    isWhatsAppConfigured()
  );
}

export async function notifySellerNewOrder(
  business: NotifyBusiness,
  orderId: string
): Promise<void> {
  if (!canNotify(business)) return;

  const order = await prisma.order.findFirst({
    where: { id: orderId, businessId: business.id },
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
  });
  if (!order) return;

  const lines = order.items.map(
    (row) =>
      `• ${row.product.name} ×${row.quantity} — ₪${(row.priceAtOrder * row.quantity).toFixed(0)}`
  );
  const total = order.items.reduce(
    (sum, row) => sum + row.priceAtOrder * row.quantity,
    0
  );

  const notes = order.notes?.trim();
  const body = [
    `הזמנה חדשה ב־${business.name}`,
    "",
    `לקוח: ${order.customerName}`,
    `טלפון: ${order.customerPhone}`,
    "",
    "פריטים:",
    ...lines,
    "",
    `סה״כ: ₪${total.toFixed(0)}`,
    ...(notes ? ["", `הערות: ${notes}`] : []),
    "",
    "פתחו את לוח הבקרה ב-Linky לעדכון הסטטוס.",
  ].join("\n");

  const result = await sendWhatsAppText(business.whatsappNotifyPhone, body);
  if (!result.ok && !("skipped" in result && result.skipped)) {
    console.error("[WhatsApp] order notify failed", orderId, result);
  }
}

export async function notifySellerNewInquiry(
  business: NotifyBusiness,
  inquiryId: string
): Promise<void> {
  if (!canNotify(business)) return;

  const inquiry = await prisma.inquiry.findFirst({
    where: { id: inquiryId, businessId: business.id },
  });
  if (!inquiry) return;

  const preview =
    inquiry.message.length > 400
      ? `${inquiry.message.slice(0, 400)}…`
      : inquiry.message;

  const phoneLine = inquiry.customerPhone
    ? `טלפון: ${inquiry.customerPhone}`
    : null;

  const body = [
    `פנייה חדשה ב־${business.name}`,
    "",
    `מאת: ${inquiry.customerName}`,
    ...(phoneLine ? [phoneLine] : []),
    "",
    preview,
    "",
    "פתחו את לוח הבקרה ב-Linky להגיבה.",
  ].join("\n");

  const result = await sendWhatsAppText(business.whatsappNotifyPhone, body);
  if (!result.ok && !("skipped" in result && result.skipped)) {
    console.error("[WhatsApp] inquiry notify failed", inquiryId, result);
  }
}

export async function sendSellerWhatsAppTest(
  business: NotifyBusiness
): Promise<{ ok: boolean; message: string }> {
  if (!business.whatsappNotifyEnabled || !business.whatsappNotifyPhone?.trim()) {
    return { ok: false, message: "יש להפעיל התראות ולשמור מספר וואטסאפ" };
  }
  if (!isWhatsAppConfigured()) {
    return {
      ok: false,
      message:
        "שליחת וואטסאפ לא מוגדרת בשרת. פנו למנהל המערכת להגדרת WHATSAPP_ACCESS_TOKEN ו-WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  const result = await sendWhatsAppText(
    business.whatsappNotifyPhone,
    `בדיקת התראות Linky — ${business.name}\n\nאם קיבלתם הודעה זו, התראות על הזמנות ופניות יגיעו לכאן.`
  );

  if (result.ok) {
    return { ok: true, message: "הודעת בדיקה נשלחה לוואטסאפ" };
  }
  if ("skipped" in result && result.skipped) {
    return { ok: false, message: result.reason };
  }
  return {
    ok: false,
    message:
      "שליחה נכשלה. ודאו שהמספר תקין ושמספר העסק ב-WhatsApp Business מאושר לשליחה.",
  };
}
