export const CUSTOMER_HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isWithinCustomerHistoryWindow(iso: string): boolean {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at <= CUSTOMER_HISTORY_WINDOW_MS;
}
