/** 0 = unlimited redemptions per customer; otherwise max count. */
export function isCouponPerCustomerLimitReached(
  maxRedemptionsPerCustomer: number,
  redemptionCount: number
): boolean {
  if (maxRedemptionsPerCustomer === 0) return false;
  return redemptionCount >= maxRedemptionsPerCustomer;
}

/** null = unlimited total redemptions; otherwise max count. */
export function isCouponTotalLimitReached(
  maxRedemptions: number | null,
  redemptionCount: number
): boolean {
  if (maxRedemptions == null) return false;
  return redemptionCount >= maxRedemptions;
}

export function couponInvalidOrExpiredError(locale: "he" | "en" = "en"): string {
  return locale === "he"
    ? "קוד הקופון לא תקין או שפג תוקפו"
    : "This coupon code is invalid or has expired";
}

export function couponRedemptionLimitError(locale: "he" | "en" = "en"): string {
  return locale === "he"
    ? "הגעת למכסת המימושים לקופון הזה"
    : "You reached the redemption limit for this coupon";
}

export function couponMinOrderError(
  minOrderAmount: number,
  locale: "he" | "en" = "en"
): string {
  return locale === "he"
    ? `סכום ההזמנה חייב להיות לפחות ${minOrderAmount.toFixed(2)} ₪ למימוש הקופון`
    : `Order total must be at least ${minOrderAmount.toFixed(2)} to use this coupon`;
}

/** Discount amount for a subtotal, capped so it never exceeds the subtotal. */
export function computeCouponDiscount(
  coupon: { discountType: "PERCENTAGE" | "FIXED"; discountValue: number },
  subtotal: number
): number {
  const raw =
    coupon.discountType === "PERCENTAGE"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  const capped = Math.min(Math.max(raw, 0), subtotal);
  return Math.round(capped * 100) / 100;
}
