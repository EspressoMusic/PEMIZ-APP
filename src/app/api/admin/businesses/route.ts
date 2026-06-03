import { prisma } from "@/lib/prisma";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk } from "@/lib/api";
import { publicBusinessUrl } from "@/lib/business";

export async function GET() {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          orders: true,
          appointments: true,
          inquiries: true,
          products: true,
          slots: true,
        },
      },
    },
  });

  const pendingOwners = await prisma.user.findMany({
    where: { business: null, role: "OWNER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return jsonOk({
    businesses: businesses.map((b) => ({
      ...b,
      publicUrl: publicBusinessUrl(b.slug),
    })),
    pendingOwners,
  });
}
