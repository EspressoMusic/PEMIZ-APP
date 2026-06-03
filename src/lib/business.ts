import { prisma } from "@/lib/prisma";
import { UNAVAILABLE_MESSAGE } from "@/lib/constants";

export async function getBusinessBySlug(slug: string) {
  return prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      products: { where: { isActive: true }, orderBy: { name: "asc" } },
      slots: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        include: {
          appointments: {
            where: { status: { not: "CANCELLED" } },
          },
        },
      },
    },
  });
}

export function isBusinessAcceptingCustomers(
  business: { isActive: boolean } | null
): business is { isActive: true } {
  return !!business?.isActive;
}

export { UNAVAILABLE_MESSAGE };

export function slotRemaining(
  slot: { maxBookings: number; appointments: unknown[] }
) {
  return Math.max(0, slot.maxBookings - slot.appointments.length);
}

export function publicBusinessUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/b/${slug}`;
}
