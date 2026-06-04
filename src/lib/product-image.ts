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
