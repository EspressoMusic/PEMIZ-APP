import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import {
  deductionsFromUnansweredInquiries,
  mergeStoreHealthInputs,
} from "@/lib/store-health-score";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const basePath = "/dashboard";
  const inquiriesHref = `${basePath}/customers/inquiries`;

  const unanswered = await prisma.inquiry.findMany({
    where: { businessId: ctx.user.business.id, sellerReply: null },
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
