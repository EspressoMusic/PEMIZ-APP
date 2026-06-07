export function effectiveServiceDurationMinutes(
  products: Array<{
    serviceDurationMinutes?: number | null;
    isActive?: boolean;
  }>,
  fallbackMinutes: number
): number {
  const durations = products
    .filter((p) => p.isActive !== false)
    .map((p) => p.serviceDurationMinutes)
    .filter((d): d is number => typeof d === "number" && d > 0);

  if (durations.length === 0) {
    return Math.max(15, Math.round(fallbackMinutes));
  }

  return Math.max(15, Math.max(...durations));
}

export function maxAppointmentsInWindow(
  windowMinutes: number,
  serviceDurationMinutes: number,
  gapMinutes: number
): number {
  const interval = serviceDurationMinutes + gapMinutes;
  if (interval <= 0) return 1;
  return Math.max(1, Math.floor(windowMinutes / interval));
}
