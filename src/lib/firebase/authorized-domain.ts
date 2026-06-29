import { getAppBaseUrl } from "@/lib/app-url";

/** Hostname to add in Firebase → Authentication → Authorized domains. */
export function readFirebaseAuthorizedDomainHint(): string | null {
  const base = getAppBaseUrl();
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

export function isFirebasePhoneAuthRealSmsHost(hostname: string): boolean {
  return hostname !== "localhost" && hostname !== "127.0.0.1";
}
