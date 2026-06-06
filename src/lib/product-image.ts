import type { AppLocale } from "@/lib/app-locale";
import {
  isAllowedImageMime,
  isValidDataImageUrl,
  isValidRemoteImageUrl,
  maxImageBytes,
} from "@/lib/upload-image";

const MAX_BYTES = maxImageBytes();

const IMAGE_ERRORS: Record<
  AppLocale,
  { type: string; size: string; read: string }
> = {
  he: {
    type: "יש להעלות תמונה בפורמט JPG, PNG או WebP",
    size: "גודל התמונה המקסימלי הוא 2MB",
    read: "שגיאה בקריאת התמונה",
  },
  en: {
    type: "Use JPG, PNG, or WebP",
    size: "Maximum image size is 2MB",
    read: "Could not read the image",
  },
};

export function readProductImageFile(
  file: File,
  locale: AppLocale = "he"
): Promise<string> {
  const err = IMAGE_ERRORS[locale];
  return new Promise((resolve, reject) => {
    if (!isAllowedImageMime(file.type)) {
      reject(new Error(err.type));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error(err.size));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error(err.read));
        return;
      }
      if (!isValidDataImageUrl(result)) {
        reject(new Error(err.read));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error(err.read));
    reader.readAsDataURL(file);
  });
}

export function isValidProductImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("data:image/")) return isValidDataImageUrl(url);
  return isValidRemoteImageUrl(url);
}

/** New saves must use uploaded URL — not inline base64. */
export function isValidProductImageUrlForSave(
  url: string | null | undefined
): boolean {
  if (!url) return true;
  if (url.startsWith("data:")) return false;
  return isValidRemoteImageUrl(url);
}

export async function compressProductImageFile(
  file: File,
  maxEdge = 1200,
  quality = 0.82
): Promise<Blob> {
  if (typeof document === "undefined") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const mime =
    file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality)
  );
  return blob ?? file;
}

export async function uploadProductImageFile(
  file: File,
  locale: AppLocale = "he"
): Promise<string> {
  const err = IMAGE_ERRORS[locale];
  if (!isAllowedImageMime(file.type)) {
    throw new Error(err.type);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(err.size);
  }

  const compressed = await compressProductImageFile(file);
  if (compressed.size > MAX_BYTES) {
    throw new Error(err.size);
  }

  const form = new FormData();
  form.append("file", compressed, file.name);

  const res = await fetch("/api/dashboard/products/image", {
    method: "POST",
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? err.read);
  }
  return data.url;
}
