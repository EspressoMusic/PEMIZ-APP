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

/** Infer mime from upload when browsers send empty type (common after canvas crop). */
export function resolveUploadedImageMime(file: File): (typeof ALLOWED_MIME)[number] | null {
  if (isAllowedImageMime(file.type)) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  // Cropped blobs are always saved as .jpg without a reliable type.
  if (!file.type) return "image/jpeg";
  return null;
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

export function isValidUploadedProductImagePath(url: string): boolean {
  if (!url.startsWith("/uploads/products/")) return false;
  if (url.length > 512 || url.includes("..")) return false;
  return /^\/uploads\/products\/[^/]+\/[a-f0-9]{32}\.(jpg|png|webp)$/.test(url);
}

export function isValidRemoteImageUrl(url: string): boolean {
  if (isValidUploadedProductImagePath(url)) return true;
  if (!url.startsWith("https://")) return false;
  if (url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
