import {
  getCustomerDeviceItem,
  removeCustomerDeviceItem,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";

export const PENDING_DEAL_TTL_MS = 24 * 60 * 60 * 1000;

export type PendingDealSnapshot = {
  id: string;
  name: string;
  dealPrice: number;
  validUntil: string;
  products: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    salePrice?: number | null;
    stock?: number | null;
    quantity?: number;
  }[];
};

export type PendingDealEntry = {
  dealId: string;
  redeemedAt: string;
  deal: PendingDealSnapshot;
};

function storageKey(slug: string) {
  return `linky-pending-deals-${slug}`;
}

export function isPendingDealExpired(
  redeemedAt: string,
  now = Date.now()
): boolean {
  const at = new Date(redeemedAt).getTime();
  if (Number.isNaN(at)) return true;
  return now - at >= PENDING_DEAL_TTL_MS;
}

export function loadPendingDeals(slug: string): PendingDealEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getCustomerDeviceItem(storageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingDealEntry[];
    if (!Array.isArray(parsed)) return [];
    const active = parsed.filter((e) => !isPendingDealExpired(e.redeemedAt));
    if (active.length !== parsed.length) {
      setCustomerDeviceItem(storageKey(slug), JSON.stringify(active));
    }
    return active;
  } catch {
    return [];
  }
}

function savePendingDeals(slug: string, entries: PendingDealEntry[]) {
  if (typeof window === "undefined") return;
  if (entries.length === 0) {
    removeCustomerDeviceItem(storageKey(slug));
    return;
  }
  setCustomerDeviceItem(storageKey(slug), JSON.stringify(entries));
}

export function addPendingDeal(
  slug: string,
  deal: PendingDealSnapshot
): PendingDealEntry[] {
  const prev = loadPendingDeals(slug);
  if (prev.some((e) => e.dealId === deal.id)) return prev;
  const next: PendingDealEntry[] = [
    ...prev,
    { dealId: deal.id, redeemedAt: new Date().toISOString(), deal },
  ];
  savePendingDeals(slug, next);
  return next;
}

export function clearPendingDeals(slug: string) {
  if (typeof window === "undefined") return;
  removeCustomerDeviceItem(storageKey(slug));
}

export function removePendingDeals(slug: string, dealIds: string[]) {
  const ids = new Set(dealIds);
  const next = loadPendingDeals(slug).filter((e) => !ids.has(e.dealId));
  savePendingDeals(slug, next);
  return next;
}

export function pendingDealsToSnapshots(entries: PendingDealEntry[]) {
  return entries.map((e) => e.deal);
}
