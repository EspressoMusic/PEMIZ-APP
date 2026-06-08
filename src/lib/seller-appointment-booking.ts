import { normalizePhone } from "@/lib/phone";

export const SELLER_WALK_IN_PHONE = "0500000000";
export const SELLER_SELF_BOOKING_NOTE = "seller:self";

export function isSellerSelfBooking(appointment: {
  customerPhone?: string;
  notes?: string | null;
}): boolean {
  if (normalizePhone(appointment.customerPhone ?? "") === SELLER_WALK_IN_PHONE) {
    return true;
  }
  return (appointment.notes ?? "").includes(SELLER_SELF_BOOKING_NOTE);
}

export function slotHasNoBookings(slot: { appointments: unknown[] }): boolean {
  return slot.appointments.length === 0;
}
