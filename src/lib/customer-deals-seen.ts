export function dealsSeenKey(slug: string) {
  return `linky-deals-seen-at-${slug}`;
}

export function loadDealsLastSeenAt(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(dealsSeenKey(slug));
}

export function saveDealsLastSeenAt(slug: string, iso: string) {
  localStorage.setItem(dealsSeenKey(slug), iso);
}

export function maxDealCreatedAt(
  deals: { createdAt: string }[]
): string | null {
  if (deals.length === 0) return null;
  return deals.reduce((max, deal) => {
    return new Date(deal.createdAt).getTime() > new Date(max).getTime()
      ? deal.createdAt
      : max;
  }, deals[0].createdAt);
}

export function countUnseenDeals(
  deals: { createdAt: string; validUntil: string }[],
  lastSeenAt: string | null,
  now = Date.now()
): number {
  if (!lastSeenAt) return deals.filter((d) => new Date(d.validUntil).getTime() > now).length;
  const seenMs = new Date(lastSeenAt).getTime();
  return deals.filter((deal) => {
    if (new Date(deal.validUntil).getTime() <= now) return false;
    return new Date(deal.createdAt).getTime() > seenMs;
  }).length;
}

/** First visit: mark existing deals as seen so only future deals badge. */
export function bootstrapDealsSeenIfNeeded(
  slug: string,
  deals: { createdAt: string }[]
): string {
  const existing = loadDealsLastSeenAt(slug);
  if (existing) return existing;
  const stamp = maxDealCreatedAt(deals) ?? new Date().toISOString();
  saveDealsLastSeenAt(slug, stamp);
  return stamp;
}
