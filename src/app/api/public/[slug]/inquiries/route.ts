import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { notifySellerNewInquiry } from "@/lib/whatsapp-seller-notify";

const schema = z.object({
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().max(20).optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("This business is currently unavailable.", 403);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const inquiry = await prisma.inquiry.create({
    data: {
      businessId: business.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      message: parsed.data.message,
    },
  });

  void notifySellerNewInquiry(
    {
      id: business.id,
      name: business.name,
      whatsappNotifyEnabled: business.whatsappNotifyEnabled,
      whatsappNotifyPhone: business.whatsappNotifyPhone,
    },
    inquiry.id
  ).catch((e) => console.error("[WhatsApp] inquiry notify", e));

  return jsonOk({ inquiryId: inquiry.id });
}
