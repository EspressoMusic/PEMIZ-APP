import { getSession } from "@/lib/auth";
import { isMasterSession } from "@/lib/master-auth";
import { prisma } from "@/lib/prisma";

export async function hasPlatformAdminAccess(): Promise<boolean> {
  if (await isMasterSession()) return true;

  const session = await getSession();
  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}
