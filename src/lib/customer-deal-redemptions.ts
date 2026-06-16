import {
  getCustomerDeviceItem,
  removeCustomerDeviceItem,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";

function storageKey(slug: string) {
  return `linky-deal-redemptions-${slug}`;
}

export function loadLocalDealRedemptionCounts(
  slug: string
): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = getCustomerDeviceItem(storageKey(slug));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalDealRedemptionCounts(
  slug: string,
  counts: Record<string, number>
) {
  if (typeof window === "undefined") return;
  if (Object.keys(counts).length === 0) {
    removeCustomerDeviceItem(storageKey(slug));
    return;
  }
  setCustomerDeviceItem(storageKey(slug), JSON.stringify(counts));
}

export function mergeDealRedemptionCounts(
  ...sources: Record<string, number>[]
): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const source of sources) {
    for (const [dealId, count] of Object.entries(source)) {
      const n = Number(count);
      if (!Number.isFinite(n) || n < 1) continue;
      merged[dealId] = Math.max(merged[dealId] ?? 0, Math.floor(n));
    }
  }
  return merged;
}

export function incrementLocalDealRedemptionCounts(
  slug: string,
  dealIds: string[]
): Record<string, number> {
  const next = { ...loadLocalDealRedemptionCounts(slug) };
  for (const dealId of dealIds) {
    next[dealId] = (next[dealId] ?? 0) + 1;
  }
  saveLocalDealRedemptionCounts(slug, next);
  return next;
}
