import { parseIsraeliMobilePhone } from "@/lib/phone";

const OWNER_EMAIL_DOMAIN = "owners.linky";

export function syntheticOwnerEmail(phone: string): string | null {
  const normalized = parseIsraeliMobilePhone(phone);
  if (!normalized) return null;
  return `${normalized}@${OWNER_EMAIL_DOMAIN}`;
}

export function isSyntheticOwnerEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${OWNER_EMAIL_DOMAIN}`);
}
