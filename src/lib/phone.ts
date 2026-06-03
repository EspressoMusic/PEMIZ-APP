export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/** Digits only, international format for WhatsApp Cloud API (e.g. 972501234567). */
export function formatPhoneForWhatsApp(phone: string): string | null {
  const digits = normalizePhone(phone);
  if (digits.length < 9) return null;
  if (digits.startsWith("972") && digits.length >= 11) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("5")) return `972${digits}`;
  if (digits.length >= 10 && !digits.startsWith("0")) return digits;
  return null;
}
