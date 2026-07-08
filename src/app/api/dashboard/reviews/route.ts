import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const reviews = await prisma.storeReview.findMany({
    where: { businessId: ctx.user.business.id },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ reviews });
}
