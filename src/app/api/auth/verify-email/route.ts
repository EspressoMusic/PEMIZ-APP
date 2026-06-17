import { NextResponse } from "next/server";
import { verifyEmailToken, sendOwnerVerificationEmail } from "@/lib/email-verification";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return jsonError("Missing token", 400);

  const result = await verifyEmailToken(token);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/verify-email?error=${encodeURIComponent(result.error)}`, base)
    );
  }

  return NextResponse.redirect(new URL("/dashboard?verified=1", base));
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not signed in", 401);
  if (!user.business) return jsonError("No store found", 404);
  if (user.emailVerified) return jsonOk({ alreadyVerified: true });

  await sendOwnerVerificationEmail(user.id);
  return jsonOk({
    message: "Verification email sent",
  });
}
