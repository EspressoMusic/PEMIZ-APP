export function computeDashboardSetupPercent(
  business: {
    isActive: boolean;
    type: string;
    description: string | null;
  },
  stats: { products: number; slots: number }
): number {
  let done = 0;
  const total = 4;

  if (business.isActive) done++;
  if (business.type === "STORE" ? stats.products > 0 : stats.slots > 0) done++;
  if (business.description?.trim()) done++;
  done++; // חשבון ושם עסק קיימים

  return Math.min(100, Math.round((done / total) * 100));
}
