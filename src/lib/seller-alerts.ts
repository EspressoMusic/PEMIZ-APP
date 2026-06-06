export type SellerAlertsSettings = {
  enabled: boolean;
  onInquiry: boolean;
  onChat: boolean;
  onNewOrder: boolean;
  onLowStock: boolean;
};

export const DEFAULT_SELLER_ALERTS: SellerAlertsSettings = {
  enabled: false,
  onInquiry: true,
  onChat: true,
  onNewOrder: true,
  onLowStock: true,
};

type BusinessAlertFields = {
  sellerAlertsEnabled?: boolean | null;
  sellerAlertOnInquiry?: boolean | null;
  sellerAlertOnChat?: boolean | null;
  sellerAlertOnNewOrder?: boolean | null;
  sellerAlertOnLowStock?: boolean | null;
};

export function sellerAlertsFromBusiness(
  business?: BusinessAlertFields | null
): SellerAlertsSettings {
  if (!business) return { ...DEFAULT_SELLER_ALERTS };
  return {
    enabled: business.sellerAlertsEnabled ?? false,
    onInquiry: business.sellerAlertOnInquiry ?? true,
    onChat: business.sellerAlertOnChat ?? true,
    onNewOrder: business.sellerAlertOnNewOrder ?? true,
    onLowStock: business.sellerAlertOnLowStock ?? true,
  };
}

export function sellerAlertsToDb(data: SellerAlertsSettings) {
  return {
    sellerAlertsEnabled: data.enabled,
    sellerAlertOnInquiry: data.onInquiry,
    sellerAlertOnChat: data.onChat,
    sellerAlertOnNewOrder: data.onNewOrder,
    sellerAlertOnLowStock: data.onLowStock,
  };
}
