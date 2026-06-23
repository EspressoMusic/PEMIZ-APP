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
      ? "היי, אני מעוניין/ת לשמוע על BiziLink"
      : "Hi, I'd like to learn about BiziLink";
  return buildWhatsAppChatUrl(marketingWhatsAppPhone(), text);
}
