import { isValidUploadedProductImagePath } from "@/lib/upload-image";

/** Omit huge base64 blobs from public HTML/API payloads; keep stored URLs. */
export function publicCatalogImageUrl(
  url: string | null | undefined
): string | null {
  if (!url?.trim()) return null;
  const t = url.trim();
  if (t.startsWith("data:")) return null;
  if (isValidUploadedProductImagePath(t)) return t;
  if (t.startsWith("https://")) return t;
  return null;
}

export function publicCatalogImageUrls(
  urls: string[] | null | undefined
): string[] {
  if (!urls?.length) return [];
  return urls
    .map((url) => publicCatalogImageUrl(url))
    .filter((url): url is string => url != null);
}
