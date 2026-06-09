import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { notifySellerInquiry } from "@/lib/seller-push";
import { parseIsraeliMobilePhone } from "@/lib/phone";
import { publicInquirySchema, zodFirstError } from "@/lib/validation/schemas";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { grantCustomerPhoneAccess } from "@/lib/customer-phone-access";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:inquiries:${slug.toLowerCase()}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("This business is currently unavailable.", 403);
  if (!isStorePanelEnabled(business, "inquiries")) {
    return jsonError("פניות לא זמינות בחנות זו", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = publicInquirySchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const inquiry = await prisma.inquiry.create({
    data: {
      businessId: business.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      subject: parsed.data.subject.trim(),
      message: parsed.data.message,
    },
  });

  void notifySellerInquiry(business.id, {
    id: inquiry.id,
    customerName: inquiry.customerName,
    subject: inquiry.subject,
  });

  const phoneRaw = parsed.data.customerPhone;
  if (phoneRaw) {
    const phone = parseIsraeliMobilePhone(phoneRaw);
    if (phone) await grantCustomerPhoneAccess(business.id, phone);
  }

  return jsonOk({ inquiryId: inquiry.id });
}
