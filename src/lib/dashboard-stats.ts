/** Last 7 days labels (Hebrew short) + keys for grouping */
export function last7DayBuckets() {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("he-IL", { weekday: "short" });
    buckets.push({ key, label });
  }
  return buckets;
}

export function demoSalesPoints() {
  return last7DayBuckets().map((b, i) => ({
    label: b.label,
    value: [420, 680, 510, 890, 740, 1200, 950][i] ?? 0,
  }));
}

export function demoOrderPoints() {
  return last7DayBuckets().map((b, i) => ({
    label: b.label,
    value: [2, 5, 3, 7, 4, 9, 6][i] ?? 0,
  }));
}
