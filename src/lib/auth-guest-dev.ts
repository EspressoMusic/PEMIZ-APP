/**
 * Sandbox guest login — bypasses Google for Paddle payment testing only.
 * Enabled on Vercel preview deployments and local development (never production).
 */
export function isGuestLoginAllowed(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.VERCEL_ENV === "preview") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}
