import {
  normalizeProductImageUrls,
  primaryProductImageUrl,
  syncProductImageFields,
} from "@/lib/product-image-urls";
import {
  publicCatalogImageUrls,
} from "@/lib/public-image-url";

type ProductImageRow = {
  imageUrl: string | null;
  imageUrls: string[];
};

export function serializeProductImages<T extends ProductImageRow>(
  product: T
): T & { imageUrl: string | null; imageUrls: string[] } {
  const stored = normalizeProductImageUrls(product.imageUrls, product.imageUrl);
  const imageUrls = publicCatalogImageUrls(stored);
  return {
    ...product,
    imageUrls,
    imageUrl: primaryProductImageUrl(imageUrls, null),
  };
}

export function productImagesForDb(urls: string[]) {
  return syncProductImageFields(urls);
}
