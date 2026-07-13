import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { publicReviewSchema, zodFirstError } from "@/lib/validation/schemas";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isCouponTotalLimitReached } from "@/lib/coupon-redemption";

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

  const [aggregate, reviews] = await Promise.all([
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
        sellerReply: true,
        sellerReplyAt: true,
        createdAt: true,
      },
    }),
  ]);

  return jsonOk({
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count.rating,
    reviews,
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

  const review = await prisma.storeReview.create({
    data: {
      businessId: business.id,
      customerName: parsed.data.customerName,
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
    },
  });

  const rewardCoupon = await findReviewRewardCoupon(business.id);

  return jsonOk({ reviewId: review.id, rewardCoupon });
}

/** The store's active auto-grant-on-review coupon, if it still has redemptions left. */
async function findReviewRewardCoupon(businessId: string) {
  const coupon = await prisma.coupon.findFirst({
    where: {
      businessId,
      autoGrantOnReview: true,
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
    },
    include: { _count: { select: { redemptions: true } } },
  });
  if (!coupon) return null;
  if (isCouponTotalLimitReached(coupon.maxRedemptions, coupon._count.redemptions)) return null;

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  };
}
