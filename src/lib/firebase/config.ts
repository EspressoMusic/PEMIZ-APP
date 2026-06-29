export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
};

export function readFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId: messagingSenderId || undefined,
  };
}

export function readFirebaseProjectId(): string | null {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    null
  );
}

export function isFirebaseAuthConfigured(): boolean {
  return readFirebaseClientConfig() !== null && readFirebaseProjectId() !== null;
}

/** @deprecated Use isFirebaseAuthConfigured */
export function isFirebasePhoneAuthConfigured(): boolean {
  return isFirebaseAuthConfigured();
}

/** @deprecated Service account no longer required for Google sign-in verification */
export function isFirebaseAdminConfigured(): boolean {
  return readFirebaseProjectId() !== null;
}

/** @deprecated Service account key not used for Google sign-in */
export function readFirebasePrivateKey(): string | null {
  return null;
}
