import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { storeInfoPatchSchema, zodFirstError } from "@/lib/validation/schemas";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  return jsonOk({
    storeOpeningHours: b.storeOpeningHours ?? "",
    storeAddress: b.storeAddress ?? "",
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = storeInfoPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
    data: {
      ...(parsed.data.storeOpeningHours !== undefined
        ? { storeOpeningHours: parsed.data.storeOpeningHours || null }
        : {}),
      ...(parsed.data.storeAddress !== undefined
        ? { storeAddress: parsed.data.storeAddress || null }
        : {}),
    },
    select: { storeOpeningHours: true, storeAddress: true },
  });

  return jsonOk({
    storeOpeningHours: updated.storeOpeningHours ?? "",
    storeAddress: updated.storeAddress ?? "",
  });
}
