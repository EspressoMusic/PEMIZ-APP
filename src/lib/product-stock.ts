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

export function maxOrderQuantity(
  stock: number | null | undefined,
  cap = 20
): number {
  if (stock == null) return cap;
  return Math.min(cap, Math.max(0, stock));
}
