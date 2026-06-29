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

export function isFirebaseAuthConfigured(): boolean {
  return readFirebaseClientConfig() !== null && isFirebaseAdminConfigured();
}

/** @deprecated Use isFirebaseAuthConfigured */
export function isFirebasePhoneAuthConfigured(): boolean {
  return isFirebaseAuthConfigured();
}

export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = readFirebasePrivateKey();
  return Boolean(projectId && clientEmail && privateKey);
}

/** Normalize service-account key from .env / Vercel (quotes, literal \\n). */
export function readFirebasePrivateKey(): string | null {
  const raw = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (!raw) return null;

  let key = raw;
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  key = key.replace(/\\n/g, "\n").trim();
  if (!key.includes("BEGIN PRIVATE KEY")) return null;
  return key;
}
