import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { storeLegalPatchSchema, zodFirstError } from "@/lib/validation/schemas";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  return jsonOk({
    storePolicy: b.storePolicy ?? "",
    storeTerms: b.storeTerms ?? "",
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = storeLegalPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
    data: {
      ...(parsed.data.storePolicy !== undefined
        ? { storePolicy: parsed.data.storePolicy || null }
        : {}),
      ...(parsed.data.storeTerms !== undefined
        ? { storeTerms: parsed.data.storeTerms || null }
        : {}),
    },
    select: { storePolicy: true, storeTerms: true },
  });

  return jsonOk({
    storePolicy: updated.storePolicy ?? "",
    storeTerms: updated.storeTerms ?? "",
  });
}
