import { prisma } from "@/lib/prisma";
import { getPlatformConfig } from "@/lib/platform-config";

export const DEFAULT_MAX_APPOINTMENTS_PER_BUSINESS = 100;
export const DEFAULT_MAX_ORDER_ITEMS_PER_ORDER = 200;

export type PlatformLimits = {
  maxAppointmentsPerBusiness: number;
  maxOrderItemsPerOrder: number;
};

export function appointmentLimitMessage(limit: number) {
  return `הגעתם למכסת ${limit} התורים בחנות. צרו קשר עם המוכר או נסו שוב מאוחר יותר.`;
}

export function orderItemsLimitMessage(limit: number) {
  return `לא ניתן להזמין יותר מ-${limit} פריטים בהזמנה אחת.`;
}

export async function getPlatformLimits(): Promise<PlatformLimits> {
  const config = await getPlatformConfig();
  return {
    maxAppointmentsPerBusiness:
      config.maxAppointmentsPerBusiness ?? DEFAULT_MAX_APPOINTMENTS_PER_BUSINESS,
    maxOrderItemsPerOrder:
      config.maxOrderItemsPerOrder ?? DEFAULT_MAX_ORDER_ITEMS_PER_ORDER,
  };
}

export function totalOrderItemQuantity(
  items: Array<{ quantity: number }>
): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function countActiveBusinessAppointments(
  businessId: string
): Promise<number> {
  return prisma.appointment.count({
    where: {
      businessId,
      status: { not: "CANCELLED" },
    },
  });
}

export async function isBusinessAppointmentLimitReached(
  businessId: string
): Promise<{ reached: boolean; limit: number; current: number }> {
  const { maxAppointmentsPerBusiness } = await getPlatformLimits();
  const current = await countActiveBusinessAppointments(businessId);
  return {
    reached: current >= maxAppointmentsPerBusiness,
    limit: maxAppointmentsPerBusiness,
    current,
  };
}
