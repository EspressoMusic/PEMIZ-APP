import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, jsonServerError } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { isScheduleLikeBusinessType } from "@/lib/types";

const schema = z.object({
  required: z.boolean(),
});

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  if (!isScheduleLikeBusinessType(ctx.user.business.type)) {
    return jsonError("עסק לא במצב תורים", 400);
  }

  return jsonOk({ required: ctx.user.business.appointmentConfirmationRequired ?? true });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  if (!isScheduleLikeBusinessType(ctx.user.business.type)) {
    return jsonError("עסק לא במצב תורים", 400);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("נתונים לא תקינים");
  }

  try {
    const updated = await prisma.business.update({
      where: { id: ctx.user.business.id },
      data: { appointmentConfirmationRequired: parsed.data.required },
      select: { appointmentConfirmationRequired: true },
    });
    return jsonOk({ required: updated.appointmentConfirmationRequired });
  } catch (e) {
    return jsonServerError(e, "dashboard:appointment-confirmation", {
      publicMessage: "שמירה נכשלה — ודא שבסיס הנתונים מעודכן (prisma db push)",
    });
  }
}
