import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizeAppLocale } from "@/lib/app-locale";
import {
  computeSalesStats,
  salesStatsPriorRange,
  salesStatsRangeStart,
  sumOrderTotals,
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
  const prior = salesStatsPriorRange(period);
  const locale = normalizeAppLocale(user.business.storeLocale);

  const orders = await prisma.order.findMany({
    where: {
      businessId: user.business.id,
      createdAt: { gte: prior.start },
      status: { not: "CANCELLED" },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const currentOrders = orders.filter((o) => o.createdAt >= since);
  const priorOrders = orders.filter(
    (o) => o.createdAt >= prior.start && o.createdAt <= prior.end
  );

  const stats = computeSalesStats(currentOrders, period, locale);
  const priorTotals = sumOrderTotals(priorOrders);

  return jsonOk({
    period,
    businessId: user.business.id,
    ...stats,
    priorRevenue: priorTotals.totalRevenue,
    priorProfit: priorTotals.totalProfit,
  });
}
