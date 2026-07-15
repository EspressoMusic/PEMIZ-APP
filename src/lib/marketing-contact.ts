import type { MarketingLocale } from "@/lib/marketing-locale";
import { buildWhatsAppChatUrl } from "@/lib/phone";

/** Default support / sales WhatsApp (override with NEXT_PUBLIC_MARKETING_WHATSAPP). */
const DEFAULT_MARKETING_WHATSAPP = "0586122187";

export function marketingWhatsAppPhone(): string {
  return process.env.NEXT_PUBLIC_MARKETING_WHATSAPP?.trim() || DEFAULT_MARKETING_WHATSAPP;
}

export function marketingWhatsAppUrl(locale: MarketingLocale): string | null {
  const text =
    locale === "he"
      ? "היי, אני מעוניין/ת לשמוע על Peymiz"
      : "Hi, I'd like to learn about Peymiz";
  return buildWhatsAppChatUrl(marketingWhatsAppPhone(), text);
}

/** Pretty display for the marketing contact number (e.g. 058-612-2187). */
export function marketingDisplayPhone(): string {
  const digits = marketingWhatsAppPhone().replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("05")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return marketingWhatsAppPhone();
}

export function marketingTelUrl(): string {
  const digits = marketingWhatsAppPhone().replace(/\D/g, "");
  const e164 =
    digits.length === 10 && digits.startsWith("0")
      ? `+972${digits.slice(1)}`
      : digits.startsWith("972")
        ? `+${digits}`
        : `+${digits}`;
  return `tel:${e164}`;
}
