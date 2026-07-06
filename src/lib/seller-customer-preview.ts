export const SELLER_PREVIEW_FROM_PARAM = "from";
export const SELLER_PREVIEW_FROM_VALUE = "seller";
export const SELLER_PREVIEW_RETURN_PARAM = "returnTo";

const DEFAULT_SELLER_RETURN = "/dashboard";

export function normalizeSellerPreviewReturn(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_SELLER_RETURN;
  }
  return trimmed.split("?")[0] || DEFAULT_SELLER_RETURN;
}

export function appendSellerPreviewQuery(
  path: string,
  returnTo: string
): string {
  const safeReturn = normalizeSellerPreviewReturn(returnTo);
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${SELLER_PREVIEW_FROM_PARAM}=${SELLER_PREVIEW_FROM_VALUE}&${SELLER_PREVIEW_RETURN_PARAM}=${encodeURIComponent(safeReturn)}`;
}

export function readSellerPreviewReturn(
  params: Pick<URLSearchParams, "get"> | null | undefined
): string | null {
  if (!params || params.get(SELLER_PREVIEW_FROM_PARAM) !== SELLER_PREVIEW_FROM_VALUE) {
    return null;
  }
  const raw = params.get(SELLER_PREVIEW_RETURN_PARAM);
  if (!raw) return DEFAULT_SELLER_RETURN;
  try {
    return normalizeSellerPreviewReturn(decodeURIComponent(raw));
  } catch {
    return DEFAULT_SELLER_RETURN;
  }
}
