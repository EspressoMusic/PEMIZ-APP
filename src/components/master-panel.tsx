"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Panel, Badge, PageTitle, Input, Alert } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
  termsAcceptedAt: string | null;
  publicUrl: string;
  owner: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
  _count: {
    orders: number;
    appointments: number;
    inquiries: number;
    products: number;
    slots: number;
  };
};

type PendingOwner = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
};

export function MasterPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([]);
  const [loading, setLoading] = useState(false);

  async function checkAuth() {
    const res = await fetch("/api/master/status");
    const data = await res.json();
    if (data.authenticated === true) {
      setAuthenticated(true);
      return;
    }
    const biz = await fetch("/api/admin/businesses");
    if (biz.ok) {
      const bizData = await biz.json();
      setBusinesses(bizData.businesses ?? []);
      setPendingOwners(bizData.pendingOwners ?? []);
      setAuthenticated(true);
      return;
    }
    setAuthenticated(false);
  }

  async function loadBusinesses() {
    const res = await fetch("/api/admin/businesses");
    const data = await res.json();
    if (res.ok) {
      setBusinesses(data.businesses);
      setPendingOwners(data.pendingOwners ?? []);
    } else if (res.status === 403) setAuthenticated(false);
  }

  async function removePendingOwner(id: string, email: string) {
    if (!confirm(`למחוק את החשבון ${email}? (ללא חנות)`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) loadBusinesses();
  }

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) loadBusinesses();
  }, [authenticated]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/master/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "שגיאה");
      return;
    }
    setAuthenticated(true);
    setKey("");
    loadBusinesses();
  }

  async function logout() {
    await fetch("/api/master/logout", { method: "POST" });
    setAuthenticated(false);
    setBusinesses([]);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    loadBusinesses();
  }

  async function removeStore(id: string, name: string) {
    if (!confirm(`למחוק את החנות "${name}"? פעולה זו בלתי הפיכה.`)) return;
    const res = await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
    if (res.ok) loadBusinesses();
  }

  if (authenticated === null) {
    return (
      <WebShell>
        <div className="px-4 py-20 text-center text-bakery-muted">טוען...</div>
      </WebShell>
    );
  }

  if (!authenticated) {
    return (
      <WebShell>
        <div className="mx-auto max-w-sm px-4 py-16">
          <PageTitle subtitle="גישת מנהל פלטפורמה לכל החנויות">
            כניסת מפתח
          </PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <Panel>
            <form onSubmit={login} className="space-y-3">
              <Input
                label="מפתח מנהל"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
                dir="ltr"
                autoComplete="off"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "בודק..." : "כניסה"}
              </Button>
            </form>
          </Panel>
          <p className="mt-4 text-center">
            <Link href="/" className="text-sm font-bold text-bakery-muted hover:text-bakery-ink">
              חזרה לדף הבית
            </Link>
          </p>
        </div>
      </WebShell>
    );
  }

  const activeCount = businesses.filter((b) => b.isActive).length;
  const pendingApproval = businesses.filter((b) => !b.isActive && !b.approvedAt);
  const sortedBusinesses = [...businesses].sort((a, b) => {
    const aPending = !a.isActive && !a.approvedAt ? 0 : 1;
    const bPending = !b.isActive && !b.approvedAt ? 0 : 1;
    return aPending - bPending;
  });

  function storeStatus(b: BusinessRow) {
    if (b.isActive) return { label: "פעיל", tone: "success" as const };
    if (!b.approvedAt) return { label: "ממתין לאישור", tone: "warning" as const };
    return { label: "מושבת", tone: "danger" as const };
  }

  function approveLabel(b: BusinessRow) {
    if (b.isActive) return "השבת חנות";
    if (!b.approvedAt) return "אשר חנות";
    return "הפעל חנות";
  }

  return (
    <WebShell>
      <div className="space-y-4 px-4 py-8 md:px-[14px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PageTitle subtitle="כל החנויות, סטטוסים ופרטי בעלים — השבתה או מחיקה">
            ניהול חנויות (מפתח)
          </PageTitle>
          <Button variant="ghost" onClick={logout}>
            יציאה
          </Button>
        </div>

        <Panel>
          <p className="text-[15px] text-bakery-ink">
            <span className="font-extrabold">{businesses.length}</span> חנויות ·{" "}
            <span className="font-extrabold text-bakery-success">{activeCount}</span> פעילות ·{" "}
            <span className="font-extrabold text-bakery-sale">
              {pendingApproval.length}
            </span>{" "}
            ממתינות לאישור ·{" "}
            <span className="font-extrabold text-bakery-error">
              {businesses.length - activeCount - pendingApproval.length}
            </span>{" "}
            מושבתות
            {pendingOwners.length > 0 && (
              <>
                {" "}
                ·{" "}
                <span className="font-extrabold text-bakery-muted">
                  {pendingOwners.length}
                </span>{" "}
                חשבונות בלי חנות
              </>
            )}
          </p>
        </Panel>

        {pendingOwners.map((u) => (
          <Panel key={u.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[18px] font-extrabold text-bakery-ink">{u.name}</p>
                  <Badge tone="warning">בלי חנות</Badge>
                </div>
                <p className="text-[14px] text-bakery-muted">
                  נרשם/ה אך לא השלים/ה יצירת חנות
                </p>
                <p dir="ltr" className="font-mono text-[14px] text-bakery-primary">
                  {u.email}
                </p>
                <p className="text-[13px] text-bakery-muted">
                  נוצר: {new Date(u.createdAt).toLocaleString("he-IL")}
                </p>
              </div>
              <Button variant="danger" onClick={() => removePendingOwner(u.id, u.email)}>
                מחק חשבון
              </Button>
            </div>
          </Panel>
        ))}

        {sortedBusinesses.map((b) => {
          const status = storeStatus(b);
          return (
          <Panel key={b.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[18px] font-extrabold text-bakery-ink">{b.name}</p>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <Badge>{b.type === "STORE" ? "חנות" : "תורים"}</Badge>
                </div>

                <p className="break-all font-mono text-[14px] text-bakery-primary" dir="ltr">
                  {b.publicUrl}
                </p>

                {b.description && (
                  <p className="text-[14px] leading-[1.45] text-bakery-muted">{b.description}</p>
                )}

                <div className="grid gap-1 text-[13px] text-bakery-muted sm:grid-cols-2">
                  <p>
                    <span className="font-bold text-bakery-ink">בעלים:</span> {b.owner.name}
                  </p>
                  <p dir="ltr" className="text-left sm:text-right">
                    {b.owner.email}
                  </p>
                  <p>
                    <span className="font-bold text-bakery-ink">אושר על ידי מנהל:</span>{" "}
                    {b.approvedAt
                      ? new Date(b.approvedAt).toLocaleString("he-IL")
                      : "ממתין"}
                  </p>
                  <p>
                    <span className="font-bold text-bakery-ink">נפתח:</span>{" "}
                    {new Date(b.createdAt).toLocaleString("he-IL")}
                  </p>
                  <p>
                    <span className="font-bold text-bakery-ink">תנאים:</span>{" "}
                    {b.termsAcceptedAt
                      ? new Date(b.termsAcceptedAt).toLocaleDateString("he-IL")
                      : "—"}
                  </p>
                </div>

                <p className="text-[12px] text-bakery-muted">
                  מוצרים {b._count.products} · הזמנות {b._count.orders} · תורים{" "}
                  {b._count.appointments} · משבצות {b._count.slots} · פניות{" "}
                  {b._count.inquiries}
                </p>

                <Link
                  href={`/b/${b.slug}`}
                  target="_blank"
                  className="inline-block text-[14px] font-bold text-bakery-primary hover:underline"
                >
                  צפייה בעמוד לקוחות →
                </Link>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  variant={b.isActive ? "danger" : "primary"}
                  onClick={() => toggleActive(b.id, b.isActive)}
                >
                  {approveLabel(b)}
                </Button>
                <Button variant="danger" onClick={() => removeStore(b.id, b.name)}>
                  מחק חנות
                </Button>
              </div>
            </div>
          </Panel>
        );
        })}

        {businesses.length === 0 && pendingOwners.length === 0 && (
          <p className="text-center text-bakery-muted">אין חנויות רשומות במערכת.</p>
        )}
      </div>
    </WebShell>
  );
}
