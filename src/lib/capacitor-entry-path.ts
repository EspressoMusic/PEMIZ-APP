/** Where the Play Store / App Store shell should land (seller login → dashboard). */
import { APP_LOGIN_PATH } from "@/lib/app-auth-paths";

export const CAPACITOR_NATIVE_ENTRY_PATH =
  process.env.NEXT_PUBLIC_CAPACITOR_ENTRY_PATH?.trim() || APP_LOGIN_PATH;

export function normalizeCapacitorEntryPath(path?: string | null): string {
  const raw = path?.trim() || APP_LOGIN_PATH;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function buildCapacitorServerUrl(
  baseUrl: string,
  entryPath?: string | null
): string {
  const entry = normalizeCapacitorEntryPath(entryPath);
  try {
    const url = new URL(baseUrl);
    url.pathname = entry;
    url.search = "";
    url.hash = "";
    return `${url.origin}${url.pathname}`;
  } catch {
    return `${baseUrl.replace(/\/$/, "")}${entry}`;
  }
}
