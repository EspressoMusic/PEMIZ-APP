import { requireBusinessOwner, type DashboardAuthResult } from "@/lib/dashboard-auth";
import { jsonError } from "@/lib/api";

/** מוצרים / שירותים — חנות מוצרים או חנות פגישות */
export async function requireCatalogOwner(): Promise<DashboardAuthResult> {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx;
  if (
    ctx.user.business.type !== "STORE" &&
    ctx.user.business.type !== "APPOINTMENTS"
  ) {
    return { ok: false, response: jsonError("סוג עסק לא נתמך", 400) };
  }
  return ctx;
}
