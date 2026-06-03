import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizePhone } from "@/lib/phone";

const schema = z.object({
  messageId: z.string().min(1),
  customerPhone: z.string().max(20),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = normalizePhone(parsed.data.customerPhone);
  if (phone.length < 9) return jsonError("מספר טלפון לא תקין");

  const message = await prisma.storeChatMessage.findFirst({
    where: {
      id: parsed.data.messageId,
      businessId: business.id,
      channel: "COMMUNITY",
    },
  });
  if (!message) return jsonError("הודעה לא נמצאה", 404);

  const existing = await prisma.storeChatMessageLike.findUnique({
    where: {
      messageId_customerPhone: {
        messageId: message.id,
        customerPhone: phone,
      },
    },
  });

  if (existing) {
    await prisma.storeChatMessageLike.delete({ where: { id: existing.id } });
    const count = await prisma.storeChatMessageLike.count({
      where: { messageId: message.id },
    });
    return jsonOk({ liked: false, likeCount: count });
  }

  await prisma.storeChatMessageLike.create({
    data: { messageId: message.id, customerPhone: phone },
  });
  const count = await prisma.storeChatMessageLike.count({
    where: { messageId: message.id },
  });
  return jsonOk({ liked: true, likeCount: count });
}
