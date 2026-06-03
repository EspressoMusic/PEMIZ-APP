import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  await prisma.business.delete({ where: { id: user.business.id } });

  return jsonOk({ deleted: true });
}
