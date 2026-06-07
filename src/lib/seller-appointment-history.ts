export const SELLER_APPOINTMENT_HISTORY_DELAY_MS = 24 * 60 * 60 * 1000;

export type SellerAppointmentLike = {
  id: string;
  slot: { startAt: string };
  sellerHiddenAt?: string | null;
};

export function isSellerAppointmentInHistory(
  appointment: SellerAppointmentLike,
  nowMs = Date.now()
): boolean {
  if (appointment.sellerHiddenAt) return true;
  const startMs = new Date(appointment.slot.startAt).getTime();
  if (Number.isNaN(startMs)) return false;
  return nowMs - startMs >= SELLER_APPOINTMENT_HISTORY_DELAY_MS;
}

export function splitSellerAppointments<T extends SellerAppointmentLike>(
  appointments: T[],
  nowMs = Date.now()
): { active: T[]; history: T[] } {
  const active: T[] = [];
  const history: T[] = [];

  for (const appointment of appointments) {
    if (isSellerAppointmentInHistory(appointment, nowMs)) {
      history.push(appointment);
    } else {
      active.push(appointment);
    }
  }

  active.sort(
    (a, b) =>
      new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime()
  );
  history.sort(
    (a, b) =>
      new Date(b.slot.startAt).getTime() - new Date(a.slot.startAt).getTime()
  );

  return { active, history };
}
