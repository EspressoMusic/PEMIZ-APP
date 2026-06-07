export type Role = "OWNER" | "ADMIN";
export type BusinessType = "STORE" | "APPOINTMENTS";

export function parseBusinessType(type: string): BusinessType {
  return type === "APPOINTMENTS" ? "APPOINTMENTS" : "STORE";
}
export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
