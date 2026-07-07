import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { parseIsraeliMobilePhone, INVALID_PHONE_MESSAGE_HE } from "@/lib/phone";
import { publicReviewSchema, zodFirstError } from "@/lib/validation/schemas";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true, storePanelsVisible: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);
  if (!isStorePanelEnabled(business, "reviews")) {
    return jsonError("ביקורות לא זמינות בחנות זו", 403);
  }

  const { searchParams } = new URL(req.url);
  const phoneRaw = searchParams.get("phone");
  const phone = phoneRaw ? parseIsraeliMobilePhone(phoneRaw) : null;

  const [aggregate, reviews, existing] = await Promise.all([
    prisma.storeReview.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.storeReview.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        customerName: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    }),
    phone
      ? prisma.storeReview.findFirst({
          where: { businessId: business.id, customerPhone: phone },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return jsonOk({
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count.rating,
    reviews,
    hasReviewed: phone ? existing !== null : undefined,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:reviews:${slug.toLowerCase()}`,
    5,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true, storePanelsVisible: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);
  if (!isStorePanelEnabled(business, "reviews")) {
    return jsonError("ביקורות לא זמינות בחנות זו", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = publicReviewSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const phone = parseIsraeliMobilePhone(parsed.data.customerPhone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const hasOrder = await prisma.order.findFirst({
    where: { businessId: business.id, customerPhone: phone },
    select: { id: true },
  });
  if (!hasOrder) {
    return jsonError("ניתן לכתוב ביקורת רק לאחר הזמנה בעסק זה", 403);
  }

  const existing = await prisma.storeReview.findFirst({
    where: { businessId: business.id, customerPhone: phone },
    select: { id: true },
  });
  if (existing) return jsonError("כבר שלחתם ביקורת לעסק הזה", 409);

  const review = await prisma.storeReview.create({
    data: {
      businessId: business.id,
      customerName: parsed.data.customerName,
      customerPhone: phone,
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
    },
  });

  return jsonOk({ reviewId: review.id });
}
