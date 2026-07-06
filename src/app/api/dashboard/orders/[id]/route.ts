import { jsonError } from "@/lib/api";

/**
 * Orders are never permanently deleted — once confirmed/completed/cancelled
 * they must stay visible in the seller's order history forever.
 */
export async function DELETE() {
  return jsonError("מחיקת הזמנות אינה נתמכת", 405);
}
