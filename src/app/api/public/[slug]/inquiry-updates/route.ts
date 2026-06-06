import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizePhone } from "@/lib/phone";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const phoneRaw = new URL(req.url).searchParams.get("phone") ?? "";
  const phone = normalizePhone(phoneRaw);
  if (phone.length < 9) return jsonError("מספר טלפון לא תקין");

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

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
