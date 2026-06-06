import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import {
  sellerAlertsFromBusiness,
  sellerAlertsToDb,
} from "@/lib/seller-alerts";

const schema = z.object({
  enabled: z.boolean(),
  onInquiry: z.boolean(),
  onChat: z.boolean(),
  onNewOrder: z.boolean(),
  onLowStock: z.boolean(),
});

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  return jsonOk(sellerAlertsFromBusiness(ctx.user.business));
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
      data: sellerAlertsToDb(parsed.data),
      select: {
        sellerAlertsEnabled: true,
        sellerAlertOnInquiry: true,
        sellerAlertOnChat: true,
        sellerAlertOnNewOrder: true,
        sellerAlertOnLowStock: true,
      },
    });
    return jsonOk(sellerAlertsFromBusiness(updated));
  } catch (e) {
    console.error("seller-alerts update failed", e);
    return jsonError(
      "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
      500
    );
  }
}
