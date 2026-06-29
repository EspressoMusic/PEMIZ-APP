"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Alert, Panel } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";
import { localizeAuthError } from "@/lib/auth-messages";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { extractFirebaseErrorCode } from "@/lib/firebase/phone-auth-dev";

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-5.522 0-10-4.478-10-10s4.478-10 10-10c2.484 0 4.735.91 6.471 2.419l6.313-6.313C33.468 9.254 28.977 7 24 7 13.507 7 5 15.507 5 26s8.507 19 19 19 19-8.507 19-19c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l7.031 5.155C15.655 16.108 19.561 13 24 13c2.484 0 4.735.91 6.471 2.419l6.313-6.313C33.468 9.254 28.977 7 24 7 13.507 7 5 15.507 5 26c0 3.017.805 5.847 2.212 8.291z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 36.091 26.715 37 24 37c-5.202 0-9.619-3.317-11.283-7.946l-7.016 5.404C7.954 39.556 15.455 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.005 2.947-3.343 5.089-6.303 5.089v6h10.611c5.953-5.488 9.389-13.574 9.389-23.089 0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function AuthForm({
  mode,
  footer,
}: {
  mode: "login" | "signup";
  footer?: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { copy, locale } = useMarketingLocale();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupConfetti, setSignupConfetti] = useState(mode === "signup");

  useEffect(() => {
    if (mode === "login" && searchParams.get("reset") === "1") {
      setInfo(copy.authPasswordResetInfo);
    }
  }, [mode, searchParams, copy.authPasswordResetInfo]);

  useEffect(() => {
    if (mode !== "signup") return;
    setSignupConfetti(true);
    const timer = window.setTimeout(() => setSignupConfetti(false), 5000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  async function signInWithGoogle() {
    setError("");
    if (!isFirebaseClientConfigured()) {
      setError(copy.authGoogleNotConfigured);
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setError(copy.authGoogleNotConfigured);
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const firebaseIdToken = await result.user.getIdToken(true);
      await signOut(auth).catch(() => {});

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseIdToken,
          allowCreate: mode === "signup",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        hasBusiness?: boolean;
        redirectTo?: string;
      };

      if (!res.ok) {
        setError(
          localizeAuthError(
            data.error ??
              (mode === "login" ? copy.authLoginError : copy.authSignupError),
            locale
          )
        );
        return;
      }

      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else if (data.hasBusiness === false) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      const code = extractFirebaseErrorCode(err);
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setError(copy.authGoogleCancelled);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("[Linky google auth]", code || err);
        }
        setError(copy.authGoogleError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell lockViewport>
      {mode === "signup" && <DashboardConfettiBackground active={signupConfetti} />}
      <div className="auth-surface mx-auto flex w-full max-w-[min(100%,24rem)] flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel className="dashboard-card flex aspect-square w-full flex-col items-center justify-center gap-8 px-7 py-9 sm:gap-10 sm:px-10 sm:py-11">
          <h1 className="text-center text-[28px] font-extrabold leading-tight text-bakery-ink sm:text-[32px]">
            {mode === "login" ? copy.authSignInTitle : copy.authCreateAccountTitle}
          </h1>
          {error ? (
            <div className="w-full">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}
          {info ? (
            <div className="w-full">
              <Alert variant="success">{info}</Alert>
            </div>
          ) : null}
          <div className="w-full space-y-6">
            <button
              type="button"
              disabled={loading}
              onClick={() => void signInWithGoogle()}
              className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-full border-2 border-bakery-border bg-white px-5 py-4 text-[17px] font-bold text-bakery-ink shadow-sm transition hover:bg-bakery-surface disabled:opacity-60 sm:min-h-[62px] sm:text-[18px]"
            >
              <GoogleIcon />
              {loading ? copy.authGoogleLoading : copy.authGoogleButton}
            </button>
            {mode === "signup" ? (
              <p className="text-center text-[14px] leading-relaxed text-bakery-muted sm:text-[15px]">
                {copy.authGoogleTermsPrefix}{" "}
                <Link
                  href="/terms"
                  className="font-bold text-bakery-ink hover:underline"
                >
                  {locale === "he" ? "תנאי השימוש" : "Terms of Service"}
                </Link>{" "}
                {copy.authGoogleTermsMiddle}{" "}
                <Link
                  href="/privacy"
                  className="font-bold text-bakery-ink hover:underline"
                >
                  {locale === "he" ? "מדיניות הפרטיות" : "Privacy Policy"}
                </Link>
                {copy.authGoogleTermsSuffix}
              </p>
            ) : null}
          </div>
        </Panel>
        {footer}
      </div>
    </WebShell>
  );
}
