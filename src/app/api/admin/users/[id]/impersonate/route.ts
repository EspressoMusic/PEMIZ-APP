import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk, jsonServerError } from "@/lib/api";
import type { Role } from "@/lib/types";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await enforceRateLimit(_req, "admin:impersonate", 30, 60 * 60 * 1000);
  if (limited) return limited;

  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        business: { select: { id: true } },
      },
    });

    if (!user) return jsonError("משתמש לא נמצא", 404);
    if (user.role === "ADMIN") {
      return jsonError("לא ניתן להיכנס לחשבון מנהל פלטפורמה", 403);
    }
    if (!user.business) {
      return jsonError("למשתמש אין חנות — אי אפשר להיכנס לדשבורד", 400);
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      adminSupport: true,
    });

    return jsonOk({ redirectTo: "/dashboard" });
  } catch (error) {
    return jsonServerError(error, "admin:impersonate");
  }
}
