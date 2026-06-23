import { parseOrderSchedule } from "@/lib/order-schedule";
import { isScheduleLikeBusinessType } from "@/lib/types";

export function isAppointmentStoreScheduleConfigured(params: {
  businessType: string;
  orderScheduleEnabled?: boolean | null;
  orderSchedule?: string | null;
}): boolean {
  if (!isScheduleLikeBusinessType(params.businessType)) return true;
  if (!params.orderScheduleEnabled) return false;
  if (!params.orderSchedule?.trim()) return false;
  const parsed = parseOrderSchedule(params.orderSchedule, true);
  return parsed.enabled && parsed.daySlots.some((day) => day.open);
}

export function isAppointmentStoreServicesConfigured(
  activeServiceCount: number
): boolean {
  return activeServiceCount >= 1;
}

export function isAppointmentStoreWelcomeSetupComplete(params: {
  businessType: string;
  orderScheduleEnabled?: boolean | null;
  orderSchedule?: string | null;
  activeServiceCount: number;
}): boolean {
  return (
    isAppointmentStoreScheduleConfigured(params) &&
    isAppointmentStoreServicesConfigured(params.activeServiceCount)
  );
}
