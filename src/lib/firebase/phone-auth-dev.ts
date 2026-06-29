import type { Auth } from "firebase/auth";
import { isFirebasePhoneAuthRealSmsHost } from "@/lib/firebase/authorized-domain";

export function isFirebasePhoneAuthLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  return !isFirebasePhoneAuthRealSmsHost(window.location.hostname);
}

/** Dev-only: allows Firebase test phone numbers on localhost without real SMS/reCAPTCHA. */
export function enableFirebasePhoneAuthDevBypass(auth: Auth): void {
  if (process.env.NODE_ENV !== "development") return;
  if (!isFirebasePhoneAuthLocalhost()) return;
  auth.settings.appVerificationDisabledForTesting = true;
}

/** SMS language + reCAPTCHA locale for real phone numbers in production. */
export function configureFirebasePhoneAuthLocale(auth: Auth): void {
  if (typeof navigator !== "undefined" && navigator.language) {
    auth.useDeviceLanguage();
    return;
  }
  auth.languageCode = document.documentElement.lang === "en" ? "en" : "he";
}

export function usesFirebasePhoneRealSms(): boolean {
  if (typeof window === "undefined") return false;
  return isFirebasePhoneAuthRealSmsHost(window.location.hostname);
}

export function extractFirebaseErrorCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: string }).code);
  }
  return "";
}
