import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  code: z.string().length(6),
});

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "phone:verify", 8, 15 * 60 * 1000);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("קוד לא תקין");

  const otp = await prisma.otpCode.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.code !== parsed.data.code) {
    return jsonError("קוד שגוי");
  }
  if (otp.expiresAt < new Date()) {
    return jsonError("הקוד פג תוקף");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phoneVerified: true },
  });
  await prisma.otpCode.deleteMany({ where: { userId: user.id } });

  return jsonOk({ verified: true });
}
