import { LOW_STOCK_THRESHOLD } from "@/lib/low-stock-threshold";

export type ProductStockStatus = "unlimited" | "ok" | "low" | "out";

export function getProductStockStatus(
  stock: number | null | undefined
): ProductStockStatus {
  if (stock == null) return "unlimited";
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

export function isProductStockAlert(
  stock: number | null | undefined
): boolean {
  const status = getProductStockStatus(stock);
  return status === "low" || status === "out";
}

export type SellerStockLabels = {
  notificationStockOut: string;
  productStockRemaining: string;
  productStockUnlimitedList: string;
  productStockLow: string;
};

export function formatSellerProductStockLabel(
  stock: number | null | undefined,
  labels: SellerStockLabels
): string {
  const status = getProductStockStatus(stock);
  if (status === "unlimited") return labels.productStockUnlimitedList;
  if (status === "out") return labels.notificationStockOut;
  return labels.productStockRemaining.replace("{n}", String(stock));
}

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
