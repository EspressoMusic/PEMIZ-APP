import { firebasePhoneMatchesIsraeliMobile } from "@/lib/phone";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export type VerifySignupPhoneResult =
  | { ok: true }
  | { ok: false; error: string };

export async function verifySignupPhoneToken(
  idToken: string,
  expectedPhone: string,
  messages: { phoneVerificationFailed: string; phoneVerificationRequired: string }
): Promise<VerifySignupPhoneResult> {
  const trimmed = idToken.trim();
  if (!trimmed) {
    return { ok: false, error: messages.phoneVerificationRequired };
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return { ok: false, error: messages.phoneVerificationFailed };
  }

  try {
    const decoded = await auth.verifyIdToken(trimmed, true);
    const firebasePhone = decoded.phone_number;
    if (!firebasePhone) {
      return { ok: false, error: messages.phoneVerificationFailed };
    }
    if (!firebasePhoneMatchesIsraeliMobile(firebasePhone, expectedPhone)) {
      return { ok: false, error: messages.phoneVerificationFailed };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: messages.phoneVerificationFailed };
  }
}
