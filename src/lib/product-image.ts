const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function readProductImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject(new Error("יש להעלות תמונה בפורמט JPG, PNG, WebP או GIF"));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error("גודל התמונה המקסימלי הוא 2MB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("שגיאה בקריאת התמונה"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("שגיאה בקריאת התמונה"));
    reader.readAsDataURL(file);
  });
}

export function isValidProductImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("https://") || url.startsWith("http://")) return url.length <= 2048;
  if (url.startsWith("data:image/")) return url.length <= 2_800_000;
  return false;
}
