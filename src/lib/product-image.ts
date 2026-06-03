import type { AppLocale } from "@/lib/app-locale";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const IMAGE_ERRORS: Record<
  AppLocale,
  { type: string; size: string; read: string }
> = {
  he: {
    type: "יש להעלות תמונה בפורמט JPG, PNG, WebP או GIF",
    size: "גודל התמונה המקסימלי הוא 2MB",
    read: "שגיאה בקריאת התמונה",
  },
  en: {
    type: "Use JPG, PNG, WebP, or GIF",
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
    if (!ALLOWED_TYPES.includes(file.type)) {
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
      resolve(result);
    };
    reader.onerror = () => reject(new Error(err.read));
    reader.readAsDataURL(file);
  });
}

export function isValidProductImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("https://") || url.startsWith("http://")) return url.length <= 2048;
  if (url.startsWith("data:image/")) return url.length <= 2_800_000;
  return false;
}
