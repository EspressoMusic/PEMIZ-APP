import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { getVapidPublicKey, isPushConfigured } from "@/lib/seller-push";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:push-config:${slug.toLowerCase()}`,
    30,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { isActive: true, storePanelsVisible: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);
  if (!isStorePanelEnabled(business, "broadcast")) {
    return jsonOk({ configured: false, publicKey: null });
  }

  return jsonOk({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
