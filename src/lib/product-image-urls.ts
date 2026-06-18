import { isValidProductImageUrlForSave } from "@/lib/product-image";

export const MAX_PRODUCT_IMAGES = 4;

/** Merge legacy single imageUrl with imageUrls array. */
export function normalizeProductImageUrls(
  imageUrls: string[] | null | undefined,
  imageUrl?: string | null
): string[] {
  const fromArray = (imageUrls ?? []).map((u) => u.trim()).filter(Boolean);
  if (fromArray.length > 0) {
    return fromArray.slice(0, MAX_PRODUCT_IMAGES);
  }
  const legacy = imageUrl?.trim();
  return legacy ? [legacy] : [];
}

export function primaryProductImageUrl(
  imageUrls: string[] | null | undefined,
  imageUrl?: string | null
): string | null {
  return normalizeProductImageUrls(imageUrls, imageUrl)[0] ?? null;
}

export function syncProductImageFields(urls: string[]): {
  imageUrl: string | null;
  imageUrls: string[];
} {
  const imageUrls = urls.map((u) => u.trim()).filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
  return { imageUrls, imageUrl: imageUrls[0] ?? null };
}

export function resolveProductImagesInput(input: {
  imageUrl?: string | null;
  imageUrls?: string[] | null;
}): string[] {
  if (input.imageUrls !== undefined && input.imageUrls !== null) {
    return normalizeProductImageUrls(input.imageUrls, null);
  }
  if (input.imageUrl?.trim()) {
    return [input.imageUrl.trim()];
  }
  return [];
}

export function isValidProductImageUrlsForSave(
  urls: string[] | null | undefined
): boolean {
  if (!urls || urls.length === 0) return true;
  if (urls.length > MAX_PRODUCT_IMAGES) return false;
  return urls.every((url) => isValidProductImageUrlForSave(url));
}
