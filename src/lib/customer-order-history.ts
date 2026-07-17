import type { CustomerLocale } from "@/lib/customer-preferences";
import { customerOrderStatusLabel } from "@/lib/order-status-label";
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
  /** Real DB order id(s) — used to refresh `status` without needing Google sign-in. */
  orderIds?: string[];
  /** Raw status code (kept in sync with the server); statusLabel is derived from this on refresh. */
  status?: string;
};

/** One order placed as a deal + regular items produces two rows sharing one history entry — surface whichever status still needs the customer's attention most. */
const STATUS_PRIORITY = ["PENDING", "REJECTED", "CANCELLED", "CONFIRMED", "COMPLETED"];

function aggregateStatus(statuses: string[]): string | undefined {
  if (statuses.length === 0) return undefined;
  for (const candidate of STATUS_PRIORITY) {
    if (statuses.includes(candidate)) return candidate;
  }
  return statuses[0];
}

/** Refreshes local history entries' status/statusLabel from a fresh {orderId: status} map — does not touch entries with no matching orderIds. */
export function updateCustomerOrderHistoryStatuses(
  slug: string,
  statusByOrderId: Record<string, string>,
  locale: CustomerLocale
): CustomerOrderHistoryEntry[] {
  const prev = loadCustomerOrderHistory(slug);
  const next = prev.map((entry) => {
    if (!entry.orderIds || entry.orderIds.length === 0) return entry;
    const known = entry.orderIds
      .map((id) => statusByOrderId[id])
      .filter((s): s is string => !!s);
    const status = aggregateStatus(known);
    if (!status || status === entry.status) return entry;
    return {
      ...entry,
      status,
      statusLabel: customerOrderStatusLabel(status, locale),
    };
  });
  setCustomerDeviceItem(storageKey(slug), JSON.stringify(next));
  return next;
}

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
