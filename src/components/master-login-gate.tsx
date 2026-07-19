"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export function MasterLoginGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/master/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "סיסמה שגויה");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאת רשת — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell>
      <div className="master-surface mx-auto w-full max-w-sm px-4 py-12 sm:py-16">
        <PageTitle subtitle="הזינו את סיסמת הגישה לפאנל">פאנל המתכנת</PageTitle>
        <div className="master-panel-outer mt-8">
          <form onSubmit={onSubmit} className="master-panel-inner space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-bakery-muted">
                סיסמה
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="master-panel-input"
                placeholder="••••••••"
              />
            </label>
            {error && (
              <p className="text-center text-[14px] font-semibold text-bakery-error">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !password.trim()}>
              {loading ? "בודק..." : "כניסה"}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm font-bold text-bakery-primary hover:underline">
            חזרה
          </Link>
        </p>
      </div>
    </WebShell>
  );
}
