const ISRAELI_MOBILE_RE = /^05[0-9]{8}$/;

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/** Canonical Israeli mobile: 05XXXXXXXX (10 digits). */
export function parseIsraeliMobilePhone(phone: string): string | null {
  const digits = normalizePhone(phone);
  if (!digits) return null;

  let local: string;
  if (digits.startsWith("972")) {
    const rest = digits.slice(3);
    if (rest.length !== 9 || !rest.startsWith("5")) return null;
    local = `0${rest}`;
  } else if (digits.length === 10 && digits.startsWith("05")) {
    local = digits;
  } else if (digits.length === 9 && digits.startsWith("5")) {
    local = `0${digits}`;
  } else {
    return null;
  }

  return ISRAELI_MOBILE_RE.test(local) ? local : null;
}

export function isValidPhone(phone: string): boolean {
  return parseIsraeliMobilePhone(phone) !== null;
}

/** E.164 format for Firebase SMS (e.g. +972501234567). */
export function formatIsraeliMobileToE164(phone: string): string | null {
  const local = parseIsraeliMobilePhone(phone);
  if (!local) return null;
  return `+972${local.slice(1)}`;
}

/** Match Firebase phone_number claim to canonical Israeli mobile. */
export function firebasePhoneMatchesIsraeliMobile(
  firebasePhone: string,
  localPhone: string
): boolean {
  const e164 = formatIsraeliMobileToE164(localPhone);
  if (!e164) return false;
  const normalizedFirebase = firebasePhone.startsWith("+")
    ? firebasePhone
    : `+${firebasePhone.replace(/\D/g, "")}`;
  return normalizedFirebase === e164;
}

export const INVALID_PHONE_MESSAGE_HE = "מספר טלפון לא תקין";
export const INVALID_PHONE_MESSAGE_EN = "Invalid phone number";

export function invalidPhoneMessage(locale?: "he" | "en"): string {
  return locale === "en" ? INVALID_PHONE_MESSAGE_EN : INVALID_PHONE_MESSAGE_HE;
}

/** Digits only, international format for wa.me links (e.g. 972501234567). */
function formatPhoneForWhatsApp(phone: string): string | null {
  const local = parseIsraeliMobilePhone(phone);
  if (!local) return null;
  return `972${local.slice(1)}`;
}

export function buildWhatsAppChatUrl(
  phone: string,
  text?: string
): string | null {
  const waPhone = formatPhoneForWhatsApp(phone);
  if (!waPhone) return null;
  const base = `https://wa.me/${waPhone}`;
  const trimmed = text?.trim();
  if (!trimmed) return base;
  return `${base}?text=${encodeURIComponent(trimmed)}`;
}
