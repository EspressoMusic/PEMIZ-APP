"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = searchParams.get("token") ?? "";
    setToken(value);
    if (!value) {
      setError("Invalid link — request a new one from forgot password");
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password");
    const confirm = fd.get("confirmPassword");

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not update your password");
        return;
      }

      router.push("/login?reset=1");
      router.refresh();
    } catch {
      setError("No server connection — check your internet and try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell lockViewport>
      <div className="auth-surface mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel className="dashboard-card sm:p-8">
          <PageTitle subtitle="Choose a new password for your account">
            New password
          </PageTitle>

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              name="password"
              type="password"
              label="New password"
              required
              minLength={8}
              autoComplete="new-password"
              dir="ltr"
              disabled={!token}
            />
            <Input
              name="confirmPassword"
              type="password"
              label="Confirm password"
              required
              minLength={8}
              autoComplete="new-password"
              dir="ltr"
              disabled={!token}
            />
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={loading || !token}
            >
              {loading ? "Saving..." : "Update password"}
            </Button>
          </form>
        </Panel>

        <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
          <Link
            href="/forgot-password"
            className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
          >
            Request a new link
          </Link>
        </p>
      </div>
    </WebShell>
  );
}
