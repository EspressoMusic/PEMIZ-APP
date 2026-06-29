import { verifyFirebaseIdToken } from "@/lib/firebase/verify-firebase-id-token";

export type GoogleIdentity = {
  email: string;
  name: string;
  uid: string;
};

export type VerifyGoogleIdTokenResult =
  | { ok: true; identity: GoogleIdentity }
  | { ok: false; error: string };

export async function verifyGoogleIdToken(
  idToken: string,
  messages: {
    googleVerificationFailed: string;
    googleVerificationRequired: string;
  }
): Promise<VerifyGoogleIdTokenResult> {
  const trimmed = idToken.trim();
  if (!trimmed) {
    return { ok: false, error: messages.googleVerificationRequired };
  }

  const verified = await verifyFirebaseIdToken(trimmed);
  if (!verified.ok) {
    return { ok: false, error: messages.googleVerificationFailed };
  }

  const { payload } = verified;
  const provider = payload.firebase?.sign_in_provider;
  if (provider !== "google.com") {
    return { ok: false, error: messages.googleVerificationFailed };
  }

  const email = payload.email?.trim().toLowerCase();
  if (!email || !payload.email_verified) {
    return { ok: false, error: messages.googleVerificationFailed };
  }

  const name =
    payload.name?.trim() ||
    payload.given_name?.trim() ||
    email.split("@")[0] ||
    "User";

  const uid = payload.sub;
  if (!uid) {
    return { ok: false, error: messages.googleVerificationFailed };
  }

  return {
    ok: true,
    identity: { email, name, uid },
  };
}
