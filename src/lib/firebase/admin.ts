import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { isFirebaseAdminConfigured } from "@/lib/firebase/config";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

function initFirebaseAdmin(): App | null {
  if (adminApp) return adminApp;
  if (!isFirebaseAdminConfigured()) return null;

  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID!.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
  return adminApp;
}

export function getFirebaseAdminAuth(): Auth | null {
  if (adminAuth) return adminAuth;
  const app = initFirebaseAdmin();
  if (!app) return null;
  adminAuth = getAuth(app);
  return adminAuth;
}
