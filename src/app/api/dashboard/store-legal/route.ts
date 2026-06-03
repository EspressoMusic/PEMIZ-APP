import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

const patchSchema = z.object({
  storePolicy: z.string().max(8000).nullable().optional(),
  storeTerms: z.string().max(8000).nullable().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const b = user.business;
  return jsonOk({
    storePolicy: b.storePolicy ?? "",
    storeTerms: b.storeTerms ?? "",
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const updated = await prisma.business.update({
    where: { id: user.business.id },
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
