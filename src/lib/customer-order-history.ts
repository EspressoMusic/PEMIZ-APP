import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  getCustomerDeviceItem,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";

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
  orderNumber?: number;
  orderNumbers?: number[];
};

function storageKey(slug: string) {
  return `linky-order-history-${slug}`;
}

export function loadCustomerOrderHistory(
  slug: string
): CustomerOrderHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getCustomerDeviceItem(storageKey(slug));
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
  setCustomerDeviceItem(storageKey(slug), JSON.stringify(next));
  return next;
}

export function formatCustomerOrderNumbers(
  orderNumber: number | undefined,
  orderNumbers: number[] | undefined
): string | null {
  const nums =
    orderNumbers && orderNumbers.length > 0
      ? orderNumbers
      : orderNumber != null
        ? [orderNumber]
        : [];
  if (nums.length === 0) return null;
  return nums.map((n) => `#${n}`).join(", ");
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
