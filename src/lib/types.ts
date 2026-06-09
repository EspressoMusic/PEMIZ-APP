export type Role = "OWNER" | "ADMIN";
export type BusinessType = "STORE" | "APPOINTMENTS" | "RENTAL";

export function parseBusinessType(type: string): BusinessType {
  if (type === "APPOINTMENTS") return "APPOINTMENTS";
  if (type === "RENTAL") return "RENTAL";
  return "STORE";
}

/** Appointments and rental stores share the same seller dashboard layout for now. */
export function isScheduleLikeBusinessType(type: string): boolean {
  return type === "APPOINTMENTS" || type === "RENTAL";
}
export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
