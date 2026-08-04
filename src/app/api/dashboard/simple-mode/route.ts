import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, jsonServerError } from "@/lib/api";
import { requireDashboardModeOwner } from "@/lib/dashboard-auth";

const schema = z.object({
  enabled: z.boolean(),
});

export async function GET() {
  const ctx = await requireDashboardModeOwner();
  if (!ctx.ok) return ctx.response;

  return jsonOk({ enabled: ctx.user.business.dashboardSimpleMode ?? false });
}

export async function PATCH(req: Request) {
  const ctx = await requireDashboardModeOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("נתונים לא תקינים");
  }

  try {
    const updated = await prisma.business.update({
      where: { id: ctx.user.business.id },
      data: { dashboardSimpleMode: parsed.data.enabled },
      select: { dashboardSimpleMode: true },
    });
    return jsonOk({ enabled: updated.dashboardSimpleMode });
  } catch (e) {
    return jsonServerError(e, "dashboard:simple-mode", {
      publicMessage: "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
    });
  }
}
