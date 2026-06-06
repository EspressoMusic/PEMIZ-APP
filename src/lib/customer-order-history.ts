import type { CustomerLocale } from "@/lib/customer-preferences";

export type OrderPreviewLine = {
  name: string;
  imageUrl?: string | null;
  qty: number;
  lineTotal: number;
  productId?: string;
  dealId?: string;
};

export type CustomerOrderHistoryEntry = {
  id: string;
  placedAt: string;
  lines: OrderPreviewLine[];
  total: number;
  statusLabel?: string;
};

function storageKey(slug: string) {
  return `linky-order-history-${slug}`;
}

export function loadCustomerOrderHistory(
  slug: string
): CustomerOrderHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerOrderHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendCustomerOrderHistory(
  slug: string,
  entry: CustomerOrderHistoryEntry
): CustomerOrderHistoryEntry[] {
  const prev = loadCustomerOrderHistory(slug);
  const next = [entry, ...prev];
  localStorage.setItem(storageKey(slug), JSON.stringify(next));
  return next;
}

export function formatCustomerOrderDate(
  iso: string,
  locale: CustomerLocale
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
