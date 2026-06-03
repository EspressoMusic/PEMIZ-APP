import { formatPhoneForWhatsApp } from "@/lib/phone";

export type WhatsAppSendResult =
  | { ok: true }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() &&
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
}

export async function sendWhatsAppText(
  toPhone: string,
  body: string
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!token || !phoneNumberId) {
    return {
      ok: false,
      skipped: true,
      reason: "WhatsApp API not configured on server",
    };
  }

  const to = formatPhoneForWhatsApp(toPhone);
  if (!to) {
    return { ok: false, error: "Invalid recipient phone number" };
  }

  const text = body.trim().slice(0, 4096);
  if (!text) {
    return { ok: false, error: "Empty message" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[WhatsApp] send failed", res.status, errBody);
    return {
      ok: false,
      error: "WhatsApp send failed",
    };
  }

  return { ok: true };
}
