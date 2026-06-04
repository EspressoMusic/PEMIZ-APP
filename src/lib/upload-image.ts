import { randomBytes } from "crypto";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageExt = "jpg" | "png" | "webp";

const MIME_TO_EXT: Record<(typeof ALLOWED_MIME)[number], AllowedImageExt> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Random filename for future disk/storage uploads (no user-controlled names). */
export function generateRandomImageFilename(mime: (typeof ALLOWED_MIME)[number]): string {
  const ext = MIME_TO_EXT[mime];
  return `${randomBytes(16).toString("hex")}.${ext}`;
}

export function isAllowedImageMime(mime: string): mime is (typeof ALLOWED_MIME)[number] {
  return (ALLOWED_MIME as readonly string[]).includes(mime);
}

export function maxImageBytes(): number {
  return MAX_BYTES;
}

export function isValidDataImageUrl(url: string): boolean {
  if (!url.startsWith("data:image/")) return false;
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(url);
  if (!match) return false;
  const base64 = match[2] ?? "";
  const bytes = Math.floor((base64.length * 3) / 4);
  return bytes <= MAX_BYTES && url.length <= 2_800_000;
}

export function isValidRemoteImageUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  if (url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
