import { getEffectivePrice, type PricedProduct } from "@/lib/product-price";

export type DealProductRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  salePrice?: number | null;
  stock?: number | null;
  isActive: boolean;
};

/** מוצרים בדיל — רשימה חדשה או יורשת משני מוצרים קודמים */
export function getDealProducts(deal: {
  items?: { sortOrder: number; product: DealProductRow }[];
  productA?: DealProductRow | null;
  productB?: DealProductRow | null;
}): DealProductRow[] {
  if (deal.items && deal.items.length > 0) {
    return [...deal.items]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => i.product);
  }
  const legacy = [deal.productA, deal.productB].filter(
    (p): p is DealProductRow => p != null
  );
  return legacy;
}

/** חלוקת מחיר הדיל בין המוצרים לפי משקל מחיר מבצע */
export function splitDealPrice(
  dealPrice: number,
  products: DealProductRow[]
): { productId: string; priceAtOrder: number }[] {
  if (products.length === 0) return [];
  const weights = products.map((p) => getEffectivePrice(p));
  const sum = weights.reduce((s, w) => s + w, 0);
  const rows: { productId: string; priceAtOrder: number }[] = [];
  let allocated = 0;

  products.forEach((p, i) => {
    if (i === products.length - 1) {
      rows.push({
        productId: p.id,
        priceAtOrder: Math.round((dealPrice - allocated) * 100) / 100,
      });
      return;
    }
    const share =
      sum > 0
        ? (dealPrice * weights[i]) / sum
        : dealPrice / products.length;
    const rounded = Math.round(share * 100) / 100;
    allocated += rounded;
    rows.push({ productId: p.id, priceAtOrder: rounded });
  });

  return rows;
}
