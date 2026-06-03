import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import {
  deductionsFromUnansweredInquiries,
  mergeStoreHealthInputs,
} from "@/lib/store-health-score";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);

  const basePath = "/dashboard";
  const inquiriesHref = `${basePath}/customers/inquiries`;

  const unanswered = await prisma.inquiry.findMany({
    where: { businessId: user.business.id, sellerReply: null },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      customerName: true,
      message: true,
    },
  });

  const snapshot = mergeStoreHealthInputs([
    deductionsFromUnansweredInquiries(unanswered, inquiriesHref),
  ]);

  return jsonOk(snapshot);
}
