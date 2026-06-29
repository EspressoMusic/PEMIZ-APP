import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

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

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return { ok: false, error: messages.googleVerificationFailed };
  }

  try {
    const decoded = await auth.verifyIdToken(trimmed, true);
    const provider =
      decoded.firebase?.sign_in_provider ??
      (decoded as { sign_in_provider?: string }).sign_in_provider;

    if (provider !== "google.com") {
      return { ok: false, error: messages.googleVerificationFailed };
    }

    const email = decoded.email?.trim().toLowerCase();
    if (!email || !decoded.email_verified) {
      return { ok: false, error: messages.googleVerificationFailed };
    }

    const name =
      decoded.name?.trim() ||
      (decoded as { given_name?: string }).given_name?.trim() ||
      email.split("@")[0] ||
      "User";

    return {
      ok: true,
      identity: {
        email,
        name,
        uid: decoded.uid,
      },
    };
  } catch {
    return { ok: false, error: messages.googleVerificationFailed };
  }
}
