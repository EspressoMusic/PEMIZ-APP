import { jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { fetchDashboardNotifications } from "@/lib/dashboard-notifications";
import { DASHBOARD_LABELS } from "@/lib/dashboard-messages";
import { parseBusinessType } from "@/lib/types";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const locale =
    ctx.user.business.storeLocale === "en" ? "en" : "he";
  const notifications = await fetchDashboardNotifications(
    ctx.user.business.id,
    DASHBOARD_LABELS[locale],
    parseBusinessType(ctx.user.business.type),
    ctx.user.business.orderConfirmationRequired ?? true
  );

  return jsonOk({ notifications });
}
