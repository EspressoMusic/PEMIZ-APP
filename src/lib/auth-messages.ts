import type { AppLocale } from "@/lib/app-locale";
import { normalizeAppLocale } from "@/lib/app-locale";
import {
  DASHBOARD_LOCALE_COOKIE,
  parseLocaleCookie,
} from "@/lib/dashboard-appearance-boot";
import { MARKETING_LOCALE_KEY } from "@/lib/marketing-locale";

export type AuthMessages = {
  accountExists: string;
  accountExistsNoStore: string;
  signupsClosed: string;
  invalidPhone: string;
  noAccountFound: string;
  incorrectPassword: string;
  invalidCredentials: string;
  passwordRequired: string;
  passwordMinLength: string;
  invalidData: string;
  nameTooShort: string;
  googleVerificationRequired: string;
  googleVerificationFailed: string;
  firebaseAuthNotConfigured: string;
};

export const AUTH_MESSAGES: Record<AppLocale, AuthMessages> = {
  en: {
    accountExists: "An account with this phone number already exists",
    accountExistsNoStore:
      "This phone is already registered, but the store was not created yet. Sign in with the same password to continue.",
    signupsClosed: "Sign-ups are closed right now. Please try again later.",
    invalidPhone: "Invalid phone number",
    noAccountFound: "No account found with this phone number",
    incorrectPassword: "Incorrect password",
    invalidCredentials: "Phone number or password is incorrect",
    passwordRequired: "Please enter a password",
    passwordMinLength: "Password must be at least 8 characters",
    invalidData: "Invalid data",
    nameTooShort: "Name must be at least 2 characters",
    googleVerificationRequired: "Google verification is required",
    googleVerificationFailed: "Google verification failed — try again",
    firebaseAuthNotConfigured: "Google sign-in is not configured",
  },
  he: {
    accountExists: "כבר קיים חשבון עם מספר הטלפון הזה",
    accountExistsNoStore:
      "מספר הטלפון כבר רשום, אבל החנות עדיין לא נוצרה. התחבר/י עם אותה סיסמה כדי להמשיך.",
    signupsClosed: "ההרשמה סגורה כרגע. נסה/י שוב מאוחר יותר.",
    invalidPhone: "מספר טלפון לא תקין",
    noAccountFound: "לא נמצא חשבון עם מספר הטלפון הזה",
    incorrectPassword: "סיסמה שגויה",
    invalidCredentials: "מספר הטלפון או הסיסמה שגויים",
    passwordRequired: "יש להזין סיסמה",
    passwordMinLength: "הסיסמה חייבת להכיל לפחות 8 תווים",
    invalidData: "נתונים לא תקינים",
    nameTooShort: "השם חייב להכיל לפחות 2 תווים",
    googleVerificationRequired: "נדרש אימות Google",
    googleVerificationFailed: "אימות Google נכשל — נסו שוב",
    firebaseAuthNotConfigured: "כניסה עם Google לא מוגדרת",
  },
};

export function getAuthMessages(locale: AppLocale): AuthMessages {
  return AUTH_MESSAGES[locale];
}

export function readLocaleFromRequest(req: Request): AppLocale {
  const cookie = req.headers.get("cookie") ?? "";
  const dashMatch = cookie.match(
    new RegExp(`(?:^|; )${DASHBOARD_LOCALE_COOKIE.replace(/-/g, "\\-")}=([^;]*)`)
  );
  if (dashMatch) {
    const parsed = parseLocaleCookie(decodeURIComponent(dashMatch[1]));
    if (parsed) return parsed;
  }
  const marketingMatch = cookie.match(
    new RegExp(`(?:^|; )${MARKETING_LOCALE_KEY.replace(/-/g, "\\-")}=([^;]*)`)
  );
  if (marketingMatch) {
    return normalizeAppLocale(decodeURIComponent(marketingMatch[1]));
  }
  return "he";
}

const EN_TO_HE = Object.fromEntries(
  (Object.keys(AUTH_MESSAGES.en) as (keyof AuthMessages)[]).map((key) => [
    AUTH_MESSAGES.en[key],
    AUTH_MESSAGES.he[key],
  ])
) as Record<string, string>;

/** Map known English auth API errors to Hebrew when UI is in Hebrew. */
export function localizeAuthError(message: string, locale: AppLocale): string {
  if (locale === "en") return message;
  return EN_TO_HE[message] ?? message;
}
