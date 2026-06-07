export function isProductInStock(stock: number | null | undefined): boolean {
  return stock == null || stock > 0;
}

export function canFulfillQuantity(
  stock: number | null | undefined,
  quantity: number
): boolean {
  if (stock == null) return true;
  return quantity <= stock;
}

export function formatStockLabel(stock: number | null | undefined): string {
  if (stock == null) return "ללא הגבלת מלאי";
  if (stock <= 0) return "אזל מהמלאי";
  return `מלאי: ${stock}`;
}

export const OUT_OF_STOCK_MESSAGE = "המוצר אזל מהמלאי";

/** Max units per product line in a single order (matches public orders API). */
const ORDER_LINE_QTY_CAP = 50;

export function maxOrderQuantity(
  stock: number | null | undefined,
  cap = ORDER_LINE_QTY_CAP
): number {
  if (stock == null) return cap;
  return Math.min(cap, Math.max(0, stock));
}

export function parseStockInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const value = parseInt(trimmed, 10);
  if (Number.isNaN(value) || value < 0) return null;
  return value;
}
