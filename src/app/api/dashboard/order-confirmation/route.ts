import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";

const schema = z.object({
  required: z.boolean(),
});

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  return jsonOk({ required: ctx.user.business.orderConfirmationRequired ?? true });
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
      data: { orderConfirmationRequired: parsed.data.required },
      select: { orderConfirmationRequired: true },
    });
    return jsonOk({ required: updated.orderConfirmationRequired });
  } catch (e) {
    console.error("order-confirmation update failed", e);
    return jsonError(
      "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
      500
    );
  }
}
