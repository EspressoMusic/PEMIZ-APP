import {
  getCustomerDeviceItem,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";

export function reviewedKey(slug: string) {
  return `linky-reviewed-${slug}`;
}

/** Reviews are anonymous (no phone stored) — dedupe on-device only. */
export function hasReviewedStore(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return getCustomerDeviceItem(reviewedKey(slug)) === "1";
}

export function markReviewedStore(slug: string): void {
  setCustomerDeviceItem(reviewedKey(slug), "1");
}
