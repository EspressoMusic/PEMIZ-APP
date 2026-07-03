/**
 * Skip the 14-day trial on local dev and Vercel preview (never production).
 */
export function isBusinessTrialBypassed(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.VERCEL_ENV === "preview") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}
