export type PublicErrorLocale = "he" | "en";

const PUBLIC_SYSTEM_ERROR: Record<PublicErrorLocale, string> = {
  he: "יש תקלה טכנית זמנית במערכת. נסה שוב מאוחר יותר.",
  en: "A temporary technical issue occurred. Please try again later.",
};

export function platformSupportContact(): string | null {
  const contact =
    process.env.PLATFORM_SUPPORT_CONTACT?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    null;
  return contact || null;
}

export function publicSupportMessage(locale: PublicErrorLocale = "en"): string {
  const contact = platformSupportContact();
  if (locale === "en") {
    return contact
      ? `For help, contact: ${contact}`
      : "For help, contact the platform administrator.";
  }
  return contact
    ? `לעזרה צור קשר: ${contact}`
    : "לעזרה צור קשר עם מנהל המערכת.";
}

export function publicSystemErrorMessage(locale: PublicErrorLocale = "en"): string {
  return `${PUBLIC_SYSTEM_ERROR[locale]} ${publicSupportMessage(locale)}`;
}
