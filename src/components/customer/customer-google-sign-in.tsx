"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { Button } from "@/components/ui";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { extractFirebaseErrorCode } from "@/lib/firebase/config";
import type { CustomerLabels } from "@/components/customer/customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
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

export function CustomerGoogleSignIn({
  slug,
  locale,
  labels,
  compact = false,
  onSignedIn,
  onBeforeRedirect,
}: {
  slug: string;
  locale: CustomerLocale;
  labels: CustomerLabels;
  compact?: boolean;
  onSignedIn: (email: string, name?: string) => void;
  // Called right before the browser navigates away for sign-in, so the
  // caller can stash anything (cart, open panels) that would otherwise be
  // lost across the full-page redirect round trip.
  onBeforeRedirect?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const redirectHandled = useRef(false);

  async function completeSignIn(firebaseIdToken: string) {
    const res = await fetch(`/api/public/${slug}/customer-auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseIdToken }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      email?: string;
      name?: string;
    };

    if (!res.ok || !data.email) {
      setError(data.error ?? labels.googleSignInError);
      return;
    }

    onSignedIn(data.email, data.name);
  }

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
          await completeSignIn(firebaseIdToken);
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
          setError(labels.googleSignInCancelled);
        } else {
          setError(labels.googleSignInError);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn() {
    setError("");
    if (!isFirebaseClientConfigured()) {
      setError(labels.googleSignInUnavailable);
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setError(labels.googleSignInUnavailable);
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // signInWithPopup breaks under Safari ITP / Chrome third-party-storage
      // restrictions / ad blockers — Firebase reports a bogus
      // popup-closed-by-user right after account selection. Redirect flow
      // doesn't depend on cross-window postMessage, so it isn't affected.
      onBeforeRedirect?.();
      await signInWithRedirect(auth, provider);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Linky google auth]", extractFirebaseErrorCode(err) || err);
      }
      setError(labels.googleSignInError);
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact ? (
        <p className="text-center text-[14px] font-semibold leading-relaxed text-bakery-muted">
          {labels.googleSignInForHistorySub}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-center text-[13px] font-semibold text-bakery-error"
        >
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        className="flex w-full min-h-[48px] items-center justify-center gap-2.5 font-extrabold"
        disabled={loading}
        onClick={() => void signIn()}
      >
        <GoogleIcon />
        {loading ? labels.googleSignInLoading : labels.googleSignInForHistory}
      </Button>
    </div>
  );
}
