export type StorePanelsVisible = {
  deals: boolean;
  broadcast: boolean;
  chat: boolean;
  inquiries: boolean;
  faq: boolean;
  orderLimits: boolean;
  settings: boolean;
  reviews: boolean;
  coupons: boolean;
  customerAddress: boolean;
  /** Customer-facing "install app" menu row in the store's settings sheet. */
  installApp: boolean;
  /** Seller-facing "Alerts" row in the seller's own account/settings screen. */
  sellerAlerts: boolean;
  /** Seller-facing "install app" row in the seller's own account/settings screen. */
  sellerInstallApp: boolean;
  /** Seller-facing deals management entry in the seller's own dashboard nav. */
  sellerDeals: boolean;
  /** Seller-facing coupons management entry in the seller's own dashboard nav. */
  sellerCoupons: boolean;
  /** Seller-facing reviews management entry in the seller's own dashboard nav. */
  sellerReviews: boolean;
};

export const DEFAULT_STORE_PANELS_VISIBLE: StorePanelsVisible = {
  deals: false,
  broadcast: true,
  chat: false,
  inquiries: true,
  faq: true,
  orderLimits: true,
  settings: true,
  reviews: false,
  coupons: false,
  customerAddress: false,
  installApp: false,
  sellerAlerts: true,
  sellerInstallApp: true,
  sellerDeals: true,
  sellerCoupons: true,
  sellerReviews: true,
};

const KEYS = Object.keys(
  DEFAULT_STORE_PANELS_VISIBLE
) as (keyof StorePanelsVisible)[];

export function parseStorePanelsVisible(
  raw: string | null | undefined
): StorePanelsVisible {
  if (!raw?.trim()) return { ...DEFAULT_STORE_PANELS_VISIBLE };
  try {
    const parsed = JSON.parse(raw) as Partial<StorePanelsVisible>;
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_STORE_PANELS_VISIBLE };
    }
    return {
      ...DEFAULT_STORE_PANELS_VISIBLE,
      ...Object.fromEntries(
        KEYS.map((key) => [
          key,
          typeof parsed[key] === "boolean"
            ? parsed[key]
            : DEFAULT_STORE_PANELS_VISIBLE[key],
        ])
      ),
    } as StorePanelsVisible;
  } catch {
    return { ...DEFAULT_STORE_PANELS_VISIBLE };
  }
}

export function storePanelsVisibleToJson(panels: StorePanelsVisible): string {
  return JSON.stringify(panels);
}

export function storePanelsFromBusiness(
  business?: { storePanelsVisible?: string | null } | null
): StorePanelsVisible {
  return parseStorePanelsVisible(business?.storePanelsVisible);
}

export function isStorePanelEnabled(
  business: { storePanelsVisible?: string | null } | null | undefined,
  panel: keyof StorePanelsVisible
): boolean {
  return storePanelsFromBusiness(business)[panel];
}

/** Dashboard "WhatsApp contact" toggle — seller phone link in the customer store. */
export function isSellerWhatsAppVisible(
  panels: StorePanelsVisible,
  sellerContactPhone: string | null | undefined
): boolean {
  return panels.chat && !!sellerContactPhone?.trim();
}
