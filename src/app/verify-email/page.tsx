"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(decodeURIComponent(err));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user?.business) {
          router.replace("/onboarding");
          return;
        }
        if (d.user?.emailVerified) {
          router.replace("/dashboard");
          return;
        }
        setEmail(d.user.email ?? "");
        setBusinessName(d.user.business?.name ?? "");
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function resend() {
    setError("");
    setInfo("");
    setLoading(true);
    const res = await fetch("/api/auth/verify-email", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error");
      return;
    }
    setInfo("Verification email sent. Check your inbox (and spam folder).");
  }

  if (checking) {
    return (
      <WebShell>
        <div className="py-20 text-center text-bakery-muted">Loading...</div>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <Panel>
          <PageTitle subtitle="After verification your store will open and the full dashboard will be available">
            Verify email
          </PageTitle>

          {businessName && (
            <p className="mb-4 text-[15px] text-bakery-muted">
              Store <strong className="text-bakery-ink">{businessName}</strong> was
              created and is waiting for email verification.
            </p>
          )}

          {email && (
            <p className="mb-4 text-[14px] text-bakery-muted" dir="ltr">
              {email}
            </p>
          )}

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          {info && (
            <div className="mb-4">
              <Alert variant="success">{info}</Alert>
            </div>
          )}

          <p className="mb-4 text-[14px] leading-[1.45] text-bakery-muted">
            We sent you a verification link by email. After you click the link,
            your store will be activated and you can manage products, orders,
            and appointments from the dashboard.
          </p>

          <Button className="w-full" onClick={resend} disabled={loading}>
            {loading ? "Sending..." : "Resend verification email"}
          </Button>

          <p className="mt-6 text-center text-[14px] text-bakery-muted">
            <Link href="/login" className="font-bold hover:text-bakery-ink">
              Sign in with a different account
            </Link>
          </p>
        </Panel>
      </div>
    </WebShell>
  );
}
