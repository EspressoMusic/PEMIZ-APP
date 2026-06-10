import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { SLUG_REGEX, UNAVAILABLE_MESSAGE } from "@/lib/constants";
import { syncBusinessTrialLock } from "@/lib/business-subscription";

function slugifyBusinessName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

  return base.length >= 3 && SLUG_REGEX.test(base) ? base : "";
}

/** Stores created before auto-activate had isActive=false and no approvedAt */
export async function activateLegacyPendingBusiness(businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b || b.isActive || b.approvedAt) return false;

  await prisma.business.update({
    where: { id: businessId },
    data: { isActive: true, approvedAt: new Date() },
  });
  return true;
}

export async function generateUniqueBusinessSlug(name: string): Promise<string> {
  const base = slugifyBusinessName(name) || "store";

  for (let i = 0; i < 50; i++) {
    const candidate =
      i === 0 ? base : `${base}-${i + 1}`.slice(0, 30).replace(/-$/, "");
    if (!SLUG_REGEX.test(candidate)) continue;
    const taken = await prisma.business.findUnique({
      where: { slug: candidate },
    });
    if (!taken) return candidate;
  }

  return `store-${randomBytes(4).toString("hex")}`;
}

export async function getBusinessBySlug(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      owner: { select: { phone: true } },
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
      faqItems: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      storeDeals: {
        where: { isActive: true, validUntil: { gt: new Date() } },
        include: {
          items: { include: { product: true }, orderBy: { sortOrder: "asc" } },
          productA: true,
          productB: true,
        },
        orderBy: { validUntil: "asc" },
      },
    },
  });

  if (business) {
    const { locked, isActive } = await syncBusinessTrialLock(business);
    if (locked) {
      return { ...business, isActive };
    }
  }

  return business;
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
