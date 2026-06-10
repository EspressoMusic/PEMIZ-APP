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

const schema = z.object({
  customerPhone: customerPhoneSchema,
  resolution: z.enum(["RESOLVED", "NOT_RESOLVED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; messageId: string }> }
) {
  const { slug, messageId } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:chat-resolution:${slug.toLowerCase()}`,
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

  const denied = await requireCustomerPhoneAccess(business.id, phone);
  if (denied) return denied;

  const message = await prisma.storeChatMessage.findFirst({
    where: {
      id: messageId,
      businessId: business.id,
      channel: "SELLER",
      authorRole: "SELLER",
    },
  });
  if (!message) return jsonError("הודעה לא נמצאה", 404);

  const messagePhone = message.customerPhone
    ? parseIsraeliMobilePhone(message.customerPhone)
    : null;
  if (!messagePhone || messagePhone !== phone) {
    return jsonError("אין הרשאה להודעה זו", 403);
  }

  const updated = await prisma.storeChatMessage.update({
    where: { id: messageId },
    data: {
      customerResolution: parsed.data.resolution,
      customerResolutionAt: new Date(),
    },
  });

  return jsonOk({
    message: {
      id: updated.id,
      customerResolution: updated.customerResolution,
      customerResolutionAt: updated.customerResolutionAt?.toISOString() ?? null,
    },
  });
}
