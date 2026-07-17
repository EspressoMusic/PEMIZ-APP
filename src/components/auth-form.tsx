"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { Alert, Panel } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { AuthBackgroundWaves } from "@/components/auth-background-waves";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";
import { localizeAuthError } from "@/lib/auth-messages";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { extractFirebaseErrorCode } from "@/lib/firebase/config";

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

export function AuthForm({ allowGuest = false }: { allowGuest?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { copy, locale } = useMarketingLocale();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const redirectHandled = useRef(false);

  useEffect(() => {
    if (searchParams.get("reset") === "1") {
      setInfo(copy.authPasswordResetInfo);
    }
  }, [searchParams, copy.authPasswordResetInfo]);

  // Handles the return leg of signInWithRedirect below — Google sends the
  // browser back to this same page after the account picker.
  useEffect(() => {
    if (redirectHandled.current || !isFirebaseClientConfigured()) return;
    redirectHandled.current = true;
    const auth = getFirebaseAuth();
    if (!auth) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return;
        setLoading(true);
        try {
          const firebaseIdToken = await result.user.getIdToken(true);
          await signOut(auth).catch(() => {});
          await completeGoogleSignIn(firebaseIdToken);
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => {
        const code = extractFirebaseErrorCode(err);
        if (
          code === "auth/user-cancelled" ||
          code === "auth/redirect-cancelled-by-user"
        ) {
          setError(copy.authGoogleCancelled);
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("[Linky google auth]", code || err);
          }
          setError(copy.authGoogleError);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function completeGoogleSignIn(firebaseIdToken: string) {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseIdToken }),
    });
    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await res.json().catch(() => ({}))) as {
          error?: string;
          hasBusiness?: boolean;
          redirectTo?: string;
          isNewUser?: boolean;
        })
      : {};

    if (!res.ok) {
      setError(
        localizeAuthError(
          data.error ??
            (res.status >= 500 ? copy.authServerError : copy.authGoogleError),
          locale
        )
      );
      return;
    }

    if (data.isNewUser) {
      setConfetti(true);
    }

    if (data.redirectTo) {
      router.push(data.redirectTo);
    } else if (data.hasBusiness === false) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

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
      // signInWithPopup breaks under Safari ITP / Chrome third-party-storage
      // restrictions / ad blockers — Firebase reports a bogus
      // popup-closed-by-user right after account selection. Redirect flow
      // doesn't depend on cross-window postMessage, so it isn't affected.
      await signInWithRedirect(auth, provider);
    } catch (err) {
      const code = extractFirebaseErrorCode(err);
      if (process.env.NODE_ENV === "development") {
        console.error("[Linky google auth]", code || err);
      }
      setError(copy.authGoogleError);
      setLoading(false);
    }
  }

  // TEST-ONLY: sandbox guest login (dev + Vercel preview). Route is hard-gated in
  // /api/auth/guest — never available on production.
  async function signInAsGuest() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? ((await res.json().catch(() => ({}))) as {
            redirectTo?: string;
            error?: string;
          })
        : {};
      if (!res.ok) {
        setError(
          data.error ??
            (locale === "he"
              ? `כניסת אורח נכשלה (${res.status}). ודאו שאתם ב-Preview URL ולא ב-production.`
              : `Guest login failed (${res.status}). Use the Preview URL, not production.`)
        );
        return;
      }
      router.push(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError(
        locale === "he"
          ? "כניסת אורח נכשלה — בדקו חיבור לרשת"
          : "Guest login failed — check your network connection"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell lockViewport>
      {confetti ? <DashboardConfettiBackground active={confetti} /> : null}
      <AuthBackgroundWaves />
      <div className="auth-surface relative z-10 mx-auto flex w-full max-w-[min(100%,24rem)] flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel className="dashboard-card flex aspect-square w-full flex-col items-center justify-center gap-8 px-7 py-9 sm:gap-10 sm:px-10 sm:py-11">
          <h1 className="text-center text-[28px] font-extrabold leading-tight text-bakery-ink sm:text-[32px]">
            {copy.authGoogleEntryTitle}
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
              className="auth-google-btn flex min-h-[58px] w-full items-center justify-center gap-3 rounded-full border-2 border-bakery-border bg-white px-5 py-4 text-[17px] font-bold text-bakery-ink shadow-sm transition hover:bg-bakery-surface disabled:cursor-not-allowed sm:min-h-[62px] sm:text-[18px]"
            >
              <span
                className={`flex items-center justify-center gap-3 ${loading ? "opacity-60" : ""}`}
              >
                <GoogleIcon />
                {loading ? copy.authGoogleLoading : copy.authGoogleButton}
              </span>
            </button>
            {allowGuest ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => void signInAsGuest()}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-bakery-border bg-bakery-square/50 px-5 py-3 text-[15px] font-bold text-bakery-ink transition hover:bg-bakery-square disabled:opacity-60"
              >
                🧪 כניסה כאורח (בדיקת תשלום)
              </button>
            ) : null}
            <p className="whitespace-nowrap text-center text-[10.5px] leading-tight text-bakery-muted sm:text-[11px]">
              {copy.authGoogleTermsPrefix}
              <Link
                href="/terms"
                className="font-bold text-bakery-ink hover:underline"
              >
                {locale === "he" ? "תנאים" : "Terms"}
              </Link>
              {copy.authGoogleTermsMiddle}
              <Link
                href="/privacy"
                className="font-bold text-bakery-ink hover:underline"
              >
                {locale === "he" ? "פרטיות" : "Privacy"}
              </Link>
              {copy.authGoogleTermsSuffix}
            </p>
          </div>
        </Panel>
      </div>
    </WebShell>
  );
}
