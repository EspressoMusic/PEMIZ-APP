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

  const inquiries = await prisma.inquiry.findMany({
    where: {
      businessId: business.id,
      customerPhone: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const matched = inquiries.filter((row) => {
    if (!row.customerPhone) return false;
    return normalizePhone(row.customerPhone) === phone;
  });

  return jsonOk({
    inquiries: matched.map((row) => ({
      id: row.id,
      message: row.message,
      sellerReply: row.sellerReply,
      sellerReplyAt: row.sellerReplyAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
