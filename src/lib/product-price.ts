export type PricedProduct = {
  price: number;
  salePrice?: number | null;
};

export function getEffectivePrice(p: PricedProduct): number {
  if (
    p.salePrice != null &&
    p.salePrice > 0 &&
    p.salePrice < p.price
  ) {
    return p.salePrice;
  }
  return p.price;
}

export function hasDiscount(p: PricedProduct): boolean {
  return getEffectivePrice(p) < p.price;
}
