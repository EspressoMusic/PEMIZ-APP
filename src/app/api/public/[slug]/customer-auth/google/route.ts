import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { grantCustomerGoogleAccess } from "@/lib/customer-google-access";
import { isFirebaseAuthConfigured } from "@/lib/firebase/config";
import { verifyGoogleIdToken } from "@/lib/firebase/verify-google-id-token";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  firebaseIdToken: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:customer-google:${slug.toLowerCase()}`,
    10,
    15 * 60 * 1000
  );
  if (limited) return limited;

  if (!isFirebaseAuthConfigured()) {
    return jsonError("Google sign-in is not configured", 503);
  }

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business || !business.isActive) {
    return jsonError("עסק לא נמצא", 404);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const verified = await verifyGoogleIdToken(parsed.data.firebaseIdToken, {
    googleVerificationFailed: "Google verification failed",
    googleVerificationRequired: "Google token required",
  });
  if (!verified.ok) return jsonError(verified.error, 401);

  await grantCustomerGoogleAccess(business.id, verified.identity.email);

  return jsonOk({
    email: verified.identity.email,
    name: verified.identity.name,
  });
}
