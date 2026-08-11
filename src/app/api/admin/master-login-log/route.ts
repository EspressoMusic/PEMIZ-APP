import { requirePlatformAdmin } from "@/lib/admin-access";
import { jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;

  const attempts = await prisma.masterLoginAttempt.findMany({
    orderBy: { at: "desc" },
    take: 50,
  });

  return jsonOk({
    attempts: attempts.map((a) => ({
      id: a.id,
      at: a.at.toISOString(),
      ip: a.ip,
      userAgent: a.userAgent,
      success: a.success,
    })),
  });
}
