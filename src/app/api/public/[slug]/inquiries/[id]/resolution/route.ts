import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { customerPhoneSchema } from "@/lib/validation/schemas";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { requireCustomerPhoneAccess } from "@/lib/customer-phone-access";
import { isCustomerResolution } from "@/lib/customer-resolution";

const schema = z.object({
  customerPhone: customerPhoneSchema,
  resolution: z.enum(["RESOLVED", "NOT_RESOLVED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:inquiry-resolution:${slug.toLowerCase()}`,
    20,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = parseIsraeliMobilePhone(parsed.data.customerPhone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);
  if (!isCustomerResolution(parsed.data.resolution)) {
    return jsonError("נתונים לא תקינים");
  }

  const denied = await requireCustomerPhoneAccess(business.id, phone);
  if (denied) return denied;

  const inquiry = await prisma.inquiry.findFirst({
    where: { id, businessId: business.id },
  });
  if (!inquiry) return jsonError("פנייה לא נמצאה", 404);
  if (!inquiry.sellerReply) return jsonError("אין תשובת חנות לפנייה זו", 400);

  const inquiryPhone = inquiry.customerPhone
    ? parseIsraeliMobilePhone(inquiry.customerPhone)
    : null;
  if (!inquiryPhone || inquiryPhone !== phone) {
    return jsonError("אין הרשאה לפנייה זו", 403);
  }

  const updated = await prisma.inquiry.update({
    where: { id },
    data: {
      customerResolution: parsed.data.resolution,
      customerResolutionAt: new Date(),
    },
  });

  return jsonOk({
    inquiry: {
      id: updated.id,
      customerResolution: updated.customerResolution,
      customerResolutionAt: updated.customerResolutionAt?.toISOString() ?? null,
    },
  });
}
