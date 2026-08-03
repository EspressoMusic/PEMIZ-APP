import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";

const schema = z.object({
  enabled: z.boolean(),
});

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  return jsonOk({ enabled: ctx.user.business.dashboardSimpleMode ?? false });
}

export async function PATCH(req: Request) {
  const ctx = await requireStoreOwner();
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
    console.error("simple-mode update failed", e);
    return jsonError(
      "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
      500
    );
  }
}
