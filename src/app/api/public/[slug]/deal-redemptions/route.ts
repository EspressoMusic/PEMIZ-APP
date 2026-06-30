import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `deal-redemptions:${slug.toLowerCase()}`,
    30,
    60_000
  );
  if (limited) return limited;

  const phoneRaw = new URL(req.url).searchParams.get("phone") ?? "";
  const phone = parseIsraeliMobilePhone(phoneRaw);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, type: true, isActive: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);
  if (business.type !== "STORE") return jsonOk({ counts: {} });

  const rows = await prisma.dealRedemption.groupBy({
    by: ["dealId"],
    where: {
      customerPhone: phone,
      deal: { businessId: business.id },
    },
    _count: { _all: true },
  });

  const counts = Object.fromEntries(
    rows.map((row) => [row.dealId, row._count._all])
  );

  return jsonOk({ counts });
}
