"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Button, Panel, Badge, PageTitle } from "@/components/ui";
import { MasterLoginGate } from "@/components/master-login-gate";
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

function DetailBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-bakery-border/30 bg-bakery-cream-light/80 p-3">
      <p className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-bakery-muted">
        {title}
      </p>
      <div className="space-y-1 text-[14px] text-bakery-ink">{children}</div>
    </div>
  );
}

function matchesStoreQuery(b: BusinessRow, query: string) {
  const s = query.trim().toLowerCase();
  if (!s) return true;
  return (
    b.name.toLowerCase().includes(s) ||
    b.slug.toLowerCase().includes(s) ||
    b.owner.email.toLowerCase().includes(s) ||
    b.owner.name.toLowerCase().includes(s) ||
    b.publicUrl.toLowerCase().includes(s)
  );
}

function matchesOwnerQuery(u: PendingOwner, query: string) {
  const s = query.trim().toLowerCase();
  if (!s) return true;
  return (
    u.name.toLowerCase().includes(s) ||
    u.email.toLowerCase().includes(s)
  );
}

export function MasterPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([]);
  const [signupsEnabled, setSignupsEnabled] = useState(true);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    const [bizRes, platformRes] = await Promise.all([
      fetch("/api/admin/businesses"),
      fetch("/api/admin/platform"),
    ]);
    const data = await bizRes.json();
    if (bizRes.ok) {
      setBusinesses(data.businesses);
      setPendingOwners(data.pendingOwners ?? []);
    } else if (bizRes.status === 403) setAuthenticated(false);

    if (platformRes.ok) {
      const platform = await platformRes.json();
      setSignupsEnabled(platform.signupsEnabled !== false);
    }
  }

  async function toggleSignups() {
    setPlatformLoading(true);
    const res = await fetch("/api/admin/platform", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signupsEnabled: !signupsEnabled }),
    });
    const data = await res.json();
    setPlatformLoading(false);
    if (res.ok) setSignupsEnabled(data.signupsEnabled);
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
    if (res.ok) {
      if (expandedId === id) setExpandedId(null);
      loadBusinesses();
    }
  }

  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => {
      const aPending = !a.isActive && !a.approvedAt ? 0 : 1;
      const bPending = !b.isActive && !b.approvedAt ? 0 : 1;
      return aPending - bPending;
    });
  }, [businesses]);

  const filteredStores = useMemo(
    () => sortedBusinesses.filter((b) => matchesStoreQuery(b, searchQuery)),
    [sortedBusinesses, searchQuery]
  );

  const filteredPendingOwners = useMemo(
    () => pendingOwners.filter((u) => matchesOwnerQuery(u, searchQuery)),
    [pendingOwners, searchQuery]
  );

  useEffect(() => {
    if (filteredStores.length === 1) {
      setExpandedId(filteredStores[0]!.id);
      return;
    }
    if (expandedId && !filteredStores.some((b) => b.id === expandedId)) {
      setExpandedId(null);
    }
  }, [searchQuery, filteredStores, expandedId]);

  if (authenticated === null) {
    return (
      <WebShell>
        <div className="px-4 py-20 text-center text-bakery-muted">טוען...</div>
      </WebShell>
    );
  }

  if (!authenticated) {
    return <MasterLoginGate />;
  }

  const activeCount = businesses.filter((b) => b.isActive).length;
  const pendingApproval = businesses.filter((b) => !b.isActive && !b.approvedAt);

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

  function toggleSuspendButtonClass(b: BusinessRow) {
    if (b.isActive) {
      return "master-btn-matte-warn w-full sm:flex-1";
    }
    return "w-full sm:flex-1";
  }

  return (
    <WebShell>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8 md:px-[14px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <PageTitle>ניהול חנויות</PageTitle>
          <Button variant="ghost" onClick={logout}>
            יציאה
          </Button>
        </div>

        <Panel className="!p-3 sm:!p-4">
          <label className="relative block">
            <span className="sr-only">חיפוש חנויות</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-bakery-muted"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם חנות, אימייל או כתובת..."
              className="w-full rounded-[16px] border border-bakery-border/40 bg-bakery-input py-3 pe-4 ps-11 text-[15px] text-bakery-ink outline-none ring-bakery-primary/30 placeholder:text-bakery-muted focus:ring-2"
              dir="auto"
            />
          </label>
          {searchQuery.trim() && (
            <p className="mt-2 text-[13px] font-semibold text-bakery-muted">
              {filteredStores.length} חנויות · {filteredPendingOwners.length} חשבונות בלי חנות
            </p>
          )}
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[16px] font-extrabold text-bakery-ink">הרשמה חדשה לאתר</p>
              <p className="mt-1 text-[14px] text-bakery-muted">
                {signupsEnabled
                  ? "משתמשים יכולים להירשם ולפתוח חנות"
                  : "ההרשמה סגורה — רק התחברות לחשבונות קיימים"}
              </p>
            </div>
            <Button
              variant={signupsEnabled ? "danger" : "primary"}
              onClick={toggleSignups}
              disabled={platformLoading}
              className="w-full sm:w-auto"
            >
              {platformLoading
                ? "שומר..."
                : signupsEnabled
                  ? "השעה הרשמה"
                  : "פתח הרשמה"}
            </Button>
          </div>
        </Panel>

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

        {filteredPendingOwners.map((u) => (
          <Panel key={u.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
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
              <Button
                variant="primary"
                className="master-btn-matte-danger w-full sm:w-auto"
                onClick={() => removePendingOwner(u.id, u.email)}
              >
                מחק חשבון
              </Button>
            </div>
          </Panel>
        ))}

        {filteredStores.map((b) => {
          const status = storeStatus(b);
          const expanded = expandedId === b.id;
          const suspendLabel = approveLabel(b);
          const isSuspendAction = b.isActive;

          return (
            <Panel key={b.id} className="!p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : b.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition hover:bg-bakery-cream-light/50 sm:px-[18px]"
                aria-expanded={expanded}
              >
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[17px] font-extrabold text-bakery-ink">{b.name}</p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <Badge>{b.type === "STORE" ? "חנות" : "תורים"}</Badge>
                  </div>
                  <p
                    className="mt-1 truncate font-mono text-[13px] text-bakery-primary"
                    dir="ltr"
                  >
                    {b.publicUrl}
                  </p>
                </div>
              </button>

              {expanded && (
                <div className="space-y-3 border-t border-bakery-border/25 px-4 pb-4 pt-3 sm:px-[18px]">
                  {b.description && (
                    <DetailBox title="תיאור">
                      <p className="leading-[1.45] text-bakery-muted">{b.description}</p>
                    </DetailBox>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <DetailBox title="בעלים">
                      <p>
                        <span className="font-bold">שם:</span> {b.owner.name}
                      </p>
                      <p dir="ltr" className="break-all font-mono text-[13px]">
                        {b.owner.email}
                      </p>
                      {b.owner.phone && (
                        <p dir="ltr" className="font-mono text-[13px]">
                          {b.owner.phone}
                        </p>
                      )}
                    </DetailBox>

                    <DetailBox title="תאריכים">
                      <p>
                        <span className="font-bold">נפתח:</span>{" "}
                        {new Date(b.createdAt).toLocaleString("he-IL")}
                      </p>
                      <p>
                        <span className="font-bold">אישור מנהל:</span>{" "}
                        {b.approvedAt
                          ? new Date(b.approvedAt).toLocaleString("he-IL")
                          : "ממתין"}
                      </p>
                      <p>
                        <span className="font-bold">תנאים:</span>{" "}
                        {b.termsAcceptedAt
                          ? new Date(b.termsAcceptedAt).toLocaleDateString("he-IL")
                          : "—"}
                      </p>
                    </DetailBox>
                  </div>

                  <DetailBox title="נתונים">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(
                        [
                          ["מוצרים", b._count.products],
                          ["הזמנות", b._count.orders],
                          ["תורים", b._count.appointments],
                          ["משבצות", b._count.slots],
                          ["פניות", b._count.inquiries],
                        ] as const
                      ).map(([label, count]) => (
                        <div
                          key={label}
                          className="rounded-[12px] border border-bakery-border/25 bg-bakery-square/60 px-2 py-2 text-center"
                        >
                          <p className="text-[11px] font-bold text-bakery-muted">{label}</p>
                          <p className="text-[18px] font-extrabold text-bakery-ink">{count}</p>
                        </div>
                      ))}
                    </div>
                  </DetailBox>

                  <div className="rounded-[16px] border border-bakery-border/30 bg-bakery-cream-light/80 p-3">
                    <Link
                      href={`/b/${b.slug}`}
                      target="_blank"
                      className="text-[14px] font-bold text-bakery-primary hover:underline"
                    >
                      צפייה בעמוד לקוחות →
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant={isSuspendAction ? "primary" : b.isActive ? "danger" : "primary"}
                      className={toggleSuspendButtonClass(b)}
                      onClick={() => toggleActive(b.id, b.isActive)}
                    >
                      {suspendLabel}
                    </Button>
                    <Button
                      variant="primary"
                      className="master-btn-matte-danger w-full sm:flex-1"
                      onClick={() => removeStore(b.id, b.name)}
                    >
                      מחק חנות
                    </Button>
                  </div>
                </div>
              )}
            </Panel>
          );
        })}

        {filteredStores.length === 0 && filteredPendingOwners.length === 0 && (
          <p className="text-center text-bakery-muted">
            {searchQuery.trim() ? "לא נמצאו תוצאות לחיפוש." : "אין חנויות רשומות במערכת."}
          </p>
        )}
      </div>
    </WebShell>
  );
}
