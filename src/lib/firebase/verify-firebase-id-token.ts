import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { readFirebaseProjectId } from "@/lib/firebase/config";

const FIREBASE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

let firebaseJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getFirebaseJwks() {
  if (!firebaseJwks) {
    firebaseJwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
  }
  return firebaseJwks;
}

export type FirebaseIdTokenPayload = JWTPayload & {
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  firebase?: {
    sign_in_provider?: string;
  };
};

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<
  { ok: true; payload: FirebaseIdTokenPayload } | { ok: false; reason: string }
> {
  const projectId = readFirebaseProjectId();
  if (!projectId) {
    return { ok: false, reason: "missing_project_id" };
  }

  try {
    const { payload } = await jwtVerify(idToken, getFirebaseJwks(), {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return { ok: true, payload: payload as FirebaseIdTokenPayload };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[firebase id token verify]", error);
    }
    return { ok: false, reason: "invalid_token" };
  }
}
