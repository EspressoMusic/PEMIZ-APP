"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { buildWhatsAppChatUrl } from "@/lib/phone";

const SUCCESS_MESSAGE =
  "Request received. Support will send a new password to the phone number you provided — use it to sign in.";

const DEVELOPER_WHATSAPP = "0586122187";

const whatsappHref = buildWhatsAppChatUrl(
  DEVELOPER_WHATSAPP,
  "Hi, I requested a password reset on Linky"
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const phone = fd.get("phone");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong — try again");
        return;
      }

      setDone(true);
      setInfo(data.message ?? SUCCESS_MESSAGE);
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
          <PageTitle>Forgot your password?</PageTitle>
          <p className="mb-4 text-center text-[14px] leading-[1.45] text-bakery-muted">
            Enter the mobile number for your account. After you submit, support
            will send you a new password.
          </p>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          {info && (
            <div className="mb-4">
              <Alert
                variant="success"
                className="border-bakery-border/35 bg-bakery-cream-light"
              >
                {info}
              </Alert>
            </div>
          )}
          {!done ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                name="phone"
                type="tel"
                label="Mobile phone"
                required
                autoComplete="tel"
                dir="ltr"
                placeholder="050-1234567"
              />
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? "Sending..." : "Send request"}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Got it
              </Button>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="auth-whatsapp-btn"
                >
                  Contact on WhatsApp
                </a>
              ) : null}
            </div>
          )}
        </Panel>

        <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
          <Link
            href="/login"
            className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </WebShell>
  );
}
