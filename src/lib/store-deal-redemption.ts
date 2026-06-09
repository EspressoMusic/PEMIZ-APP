/** 0 = unlimited redemptions per customer; otherwise max count. */
export function isDealRedemptionLimitReached(
  maxRedemptionsPerCustomer: number,
  redemptionCount: number
): boolean {
  if (maxRedemptionsPerCustomer === 0) return false;
  return redemptionCount >= maxRedemptionsPerCustomer;
}

export function dealRedemptionLimitError(
  maxRedemptionsPerCustomer: number,
  locale: "he" | "en" = "he"
): string {
  if (maxRedemptionsPerCustomer === 1) {
    return locale === "he"
      ? "כבר מימשת את הדיל הזה"
      : "You have already redeemed this deal";
  }
  return locale === "he"
    ? "הגעת למכסת המימושים לדיל הזה"
    : "You reached the redemption limit for this deal";
}
