export function appBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) return "http://localhost:3000";
  return url.replace(/\/$/, "");
}
