import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { requireCustomerPhoneAccess } from "@/lib/customer-phone-access";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:inquiry-updates:get:${slug.toLowerCase()}`,
    20,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const phoneRaw = new URL(req.url).searchParams.get("phone") ?? "";
  const phone = parseIsraeliMobilePhone(phoneRaw);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  const denied = await requireCustomerPhoneAccess(business.id, phone);
  if (denied) return denied;

  const phoneVariants = [...new Set([phone, phoneRaw.trim()].filter(Boolean))];
  const inquiries = await prisma.inquiry.findMany({
    where: {
      businessId: business.id,
      customerPhone: { in: phoneVariants },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return jsonOk({
    inquiries: inquiries.map((row) => ({
      id: row.id,
      subject: row.subject,
      message: row.message,
      sellerReply: row.sellerReply,
      sellerReplyAt: row.sellerReplyAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
