import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);

  const inquiries = await prisma.inquiry.findMany({
    where: { businessId: user.business.id },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ inquiries });
}
