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
};

export const DEFAULT_STORE_PANELS_VISIBLE: StorePanelsVisible = {
  deals: false,
  broadcast: true,
  chat: false,
  inquiries: true,
  faq: true,
  orderLimits: true,
  settings: true,
  reviews: true,
  coupons: false,
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
