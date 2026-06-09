import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  publicDealInclude,
  serializePublicStoreDeal,
} from "@/lib/public-deals";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true, type: true, storePanelsVisible: true },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);
  if (business.type !== "STORE") return jsonOk({ deals: [] });
  if (!isStorePanelEnabled(business, "deals")) return jsonOk({ deals: [] });

  const deals = await prisma.storeDeal.findMany({
    where: {
      businessId: business.id,
      isActive: true,
      validUntil: { gt: new Date() },
    },
    include: publicDealInclude,
    orderBy: { createdAt: "desc" },
  });

  return jsonOk({ deals: deals.map((deal) => serializePublicStoreDeal(deal)) });
}
