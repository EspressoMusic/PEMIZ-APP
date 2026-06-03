import type { CustomerLocale } from "@/lib/customer-preferences";

export function formatCustomerMoney(amount: number, locale: CustomerLocale): string {
  const value = amount.toFixed(2);
  return locale === "he" ? `₪${value}` : `$${value}`;
}
