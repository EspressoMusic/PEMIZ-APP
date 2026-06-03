import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: {
      isActive: true,
      storeBroadcast: true,
      storeBroadcastAt: true,
    },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  if (!business.storeBroadcast?.trim()) {
    return jsonOk({ message: null, sentAt: null });
  }

  return jsonOk({
    message: business.storeBroadcast,
    sentAt: business.storeBroadcastAt?.toISOString() ?? null,
  });
}
