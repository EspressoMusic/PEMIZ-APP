import { getEffectivePrice, type PricedProduct } from "@/lib/product-price";

export const MAX_DEAL_PRODUCT_LINES = 3;

export type DealProductRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  salePrice?: number | null;
  stock?: number | null;
  isActive: boolean;
};

export type DealLineRow = {
  product: DealProductRow;
  quantity: number;
};

/** שורות בדיל עם כמות — רשימה חדשה או יורשת משני מוצרים קודמים */
export function getDealLines(deal: {
  items?: { sortOrder: number; quantity?: number; product: DealProductRow }[];
  productA?: DealProductRow | null;
  productB?: DealProductRow | null;
}): DealLineRow[] {
  if (deal.items && deal.items.length > 0) {
    return [...deal.items]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        product: i.product,
        quantity: Math.max(1, i.quantity ?? 1),
      }));
  }
  const legacy = [deal.productA, deal.productB].filter(
    (p): p is DealProductRow => p != null
  );
  return legacy.map((product) => ({ product, quantity: 1 }));
}

/** מוצרים בדיל — ללא כמות (תאימות לאחור) */
export function getDealProducts(deal: {
  items?: { sortOrder: number; quantity?: number; product: DealProductRow }[];
  productA?: DealProductRow | null;
  productB?: DealProductRow | null;
}): DealProductRow[] {
  return getDealLines(deal).map((line) => line.product);
}

/** חלוקת מחיר הדיל בין המוצרים לפי משקל מחיר מבצע × כמות */
export function splitDealPrice(
  dealPrice: number,
  lines: DealLineRow[]
): { productId: string; quantity: number; priceAtOrder: number }[] {
  if (lines.length === 0) return [];
  const weights = lines.map(
    (line) => getEffectivePrice(line.product) * line.quantity
  );
  const sum = weights.reduce((s, w) => s + w, 0);
  const rows: {
    productId: string;
    quantity: number;
    lineTotal: number;
  }[] = [];
  let allocated = 0;

  lines.forEach((line, i) => {
    if (i === lines.length - 1) {
      rows.push({
        productId: line.product.id,
        quantity: line.quantity,
        lineTotal: Math.round((dealPrice - allocated) * 100) / 100,
      });
      return;
    }
    const share =
      sum > 0 ? (dealPrice * weights[i]) / sum : dealPrice / lines.length;
    const rounded = Math.round(share * 100) / 100;
    allocated += rounded;
    rows.push({
      productId: line.product.id,
      quantity: line.quantity,
      lineTotal: rounded,
    });
  });

  return rows.map((row) => ({
    productId: row.productId,
    quantity: row.quantity,
    priceAtOrder: Math.round((row.lineTotal / row.quantity) * 100) / 100,
  }));
}
