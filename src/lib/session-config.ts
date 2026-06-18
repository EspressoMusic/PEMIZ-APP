/** Seller stays signed in on this device until explicit logout from settings. */
export const SELLER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

/** Refresh the session cookie when less than this remains (sliding window). */
export const SELLER_SESSION_SLIDE_REFRESH_SECONDS = 60 * 60 * 24 * 30;

/** Admin impersonation sessions stay shorter. */
export const ADMIN_SUPPORT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function sessionJwtExpiryFromSeconds(maxAgeSeconds: number): string {
  return `${Math.max(1, Math.ceil(maxAgeSeconds / 86400))}d`;
}

export function shouldSlideRefreshSession(tokenExpUnix?: number): boolean {
  if (!tokenExpUnix) return true;
  const remainingMs = tokenExpUnix * 1000 - Date.now();
  return remainingMs < SELLER_SESSION_SLIDE_REFRESH_SECONDS * 1000;
}
