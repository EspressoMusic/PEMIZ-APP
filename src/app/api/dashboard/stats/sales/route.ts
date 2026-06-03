import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  computeSalesStats,
  salesStatsRangeStart,
  type SalesStatsPeriod,
} from "@/lib/sales-stats";

const periodSchema = z.enum(["week", "month", "year"]);

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const url = new URL(req.url);
  const parsed = periodSchema.safeParse(url.searchParams.get("period") ?? "week");
  if (!parsed.success) return jsonError("תקופה לא תקינה");

  const period = parsed.data as SalesStatsPeriod;
  const since = salesStatsRangeStart(period);

  const orders = await prisma.order.findMany({
    where: {
      businessId: user.business.id,
      createdAt: { gte: since },
      status: { not: "CANCELLED" },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const stats = computeSalesStats(orders, period);
  return jsonOk({ period, ...stats });
}
