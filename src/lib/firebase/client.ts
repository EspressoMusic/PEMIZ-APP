"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  type Auth,
} from "firebase/auth";
import { readFirebaseClientConfig } from "@/lib/firebase/config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let emulatorConnected = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  const config = readFirebaseClientConfig();
  if (!config) return null;
  app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  auth = getAuth(firebaseApp);

  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR === "true" &&
    !emulatorConnected
  ) {
    const host =
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ??
      "http://127.0.0.1:9099";
    connectAuthEmulator(auth, host, { disableWarnings: true });
    emulatorConnected = true;
  }

  return auth;
}

export function isFirebaseClientConfigured(): boolean {
  return readFirebaseClientConfig() !== null;
}
