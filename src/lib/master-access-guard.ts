import { getClientIp } from "@/lib/security/rate-limit";

const MIN_MASTER_KEY_LENGTH = 16;

export function isMasterKeyStrongEnough(key: string): boolean {
  return key.length >= MIN_MASTER_KEY_LENGTH;
}

/** Optional comma-separated allowlist (MASTER_ALLOWED_IPS). Empty = allow all. */
export function isMasterLoginAllowedFromIp(req: Request): boolean {
  const raw = process.env.MASTER_ALLOWED_IPS?.trim();
  if (!raw) return true;

  const allowed = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;

  const clientIp = getClientIp(req);
  return allowed.includes(clientIp);
}
