"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Alert, Button, Badge, PageTitle, Textarea, Input } from "@/components/ui";
import { MasterLoginGate } from "@/components/master-login-gate";
import { WebShell } from "@/components/web-shell";
import {
  BUSINESS_TRIAL_DAYS,
  getBusinessTrialStatus,
  trialWarningScheduleLabelHe,
  type BusinessTrialStatus,
} from "@/lib/business-trial";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
  subscriptionActiveAt: string | null;
  subscriptionPlan: string | null;
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

type SystemIncidentRow = {
  id: string;
  at: string;
  context: string;
  publicMessage: string;
  developerMessage: string;
  stack?: string;
};

function MasterOuter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`master-panel-outer ${className}`}>{children}</div>;
}

function MasterInner({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`master-panel-inner ${className}`}>{children}</div>;
}

function DetailBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <MasterInner>
      <p className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-bakery-muted">
        {title}
      </p>
      <div className="space-y-1 text-[14px] text-bakery-ink">{children}</div>
    </MasterInner>
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

function trialStatusForBusiness(b: BusinessRow, now: number): BusinessTrialStatus {
  return getBusinessTrialStatus(
    {
      createdAt: new Date(b.createdAt),
      subscriptionActiveAt: b.subscriptionActiveAt
        ? new Date(b.subscriptionActiveAt)
        : null,
    },
    now
  );
}

function trialBadgeMeta(status: BusinessTrialStatus) {
  if (status.hasSubscription) {
    return { label: "מנוי פעיל", tone: "success" as const };
  }
  if (status.expired) {
    return { label: "ניסיון נגמר", tone: "danger" as const };
  }
  if (status.daysRemaining <= 7) {
    return {
      label: `${status.daysRemaining} ימים לסיום`,
      tone: "warning" as const,
    };
  }
  return {
    label: `${status.daysRemaining} ימים לסיום`,
    tone: "default" as const,
  };
}

function formatTrialCountdown(status: BusinessTrialStatus): string {
  if (status.hasSubscription) {
    return "מנוי פעיל — החנות לא תיעצר בגלל תקופת הניסיון.";
  }
  if (status.expired) {
    return "תקופת הניסיון נגמרה — החנות אמורה להיעצר ללקוחות.";
  }
  const parts: string[] = [];
  if (status.daysRemaining > 0) parts.push(`${status.daysRemaining} ימים`);
  if (status.hoursRemaining > 0) parts.push(`${status.hoursRemaining} שעות`);
  if (
    status.daysRemaining === 0 &&
    status.hoursRemaining === 0 &&
    status.minutesRemaining > 0
  ) {
    parts.push(`${status.minutesRemaining} דקות`);
  }
  return parts.length > 0 ? `נותרו ${parts.join(" ו-")}` : "פחות מדקה";
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
  const [trialClosureEnabled, setTrialClosureEnabled] = useState(true);
  const [trialWarningEmailsEnabled, setTrialWarningEmailsEnabled] =
    useState(true);
  const [maxAppointmentsPerBusiness, setMaxAppointmentsPerBusiness] =
    useState(100);
  const [maxOrderItemsPerOrder, setMaxOrderItemsPerOrder] = useState(200);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<SystemIncidentRow[]>([]);
  const [incidentsOpen, setIncidentsOpen] = useState(true);
  const [trialClock, setTrialClock] = useState(0);
  const [ownerMessageDrafts, setOwnerMessageDrafts] = useState<
    Record<string, string>
  >({});
  const [ownerMessageSendingId, setOwnerMessageSendingId] = useState<
    string | null
  >(null);
  const [ownerMessageFeedback, setOwnerMessageFeedback] = useState<
    Record<string, { tone: "success" | "error"; text: string }>
  >({});
  const [ownerEmailDrafts, setOwnerEmailDrafts] = useState<Record<string, string>>(
    {}
  );
  const [ownerPasswordDrafts, setOwnerPasswordDrafts] = useState<
    Record<string, string>
  >({});
  const [ownerCredSavingId, setOwnerCredSavingId] = useState<string | null>(null);
  const [ownerCredFeedback, setOwnerCredFeedback] = useState<
    Record<string, { tone: "success" | "error"; text: string }>
  >({});
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    const id = window.setInterval(() => setTrialClock((tick) => tick + 1), 60_000);
    return () => window.clearInterval(id);
  }, [authenticated]);

  async function checkAuth() {
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

  async function loadIncidents() {
    const res = await fetch("/api/admin/incidents");
    if (!res.ok) return;
    const data = await res.json();
    setIncidents(data.incidents ?? []);
  }

  async function clearIncidents() {
    const res = await fetch("/api/admin/incidents", { method: "DELETE" });
    if (res.ok) setIncidents([]);
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
      setTrialClosureEnabled(platform.trialClosureEnabled !== false);
      setTrialWarningEmailsEnabled(
        platform.trialWarningEmailsEnabled !== false
      );
      if (typeof platform.maxAppointmentsPerBusiness === "number") {
        setMaxAppointmentsPerBusiness(platform.maxAppointmentsPerBusiness);
      }
      if (typeof platform.maxOrderItemsPerOrder === "number") {
        setMaxOrderItemsPerOrder(platform.maxOrderItemsPerOrder);
      }
    }
  }

  async function patchPlatform(
    patch: Record<string, boolean | number>
  ) {
    setPlatformLoading(true);
    const res = await fetch("/api/admin/platform", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setPlatformLoading(false);
    if (!res.ok) return;
    if (typeof data.signupsEnabled === "boolean") {
      setSignupsEnabled(data.signupsEnabled);
    }
    if (typeof data.trialClosureEnabled === "boolean") {
      setTrialClosureEnabled(data.trialClosureEnabled);
    }
    if (typeof data.trialWarningEmailsEnabled === "boolean") {
      setTrialWarningEmailsEnabled(data.trialWarningEmailsEnabled);
    }
    if (typeof data.maxAppointmentsPerBusiness === "number") {
      setMaxAppointmentsPerBusiness(data.maxAppointmentsPerBusiness);
    }
    if (typeof data.maxOrderItemsPerOrder === "number") {
      setMaxOrderItemsPerOrder(data.maxOrderItemsPerOrder);
    }
  }

  async function savePlatformLimits() {
    const appointments = Number(maxAppointmentsPerBusiness);
    const orderItems = Number(maxOrderItemsPerOrder);
    if (
      !Number.isInteger(appointments) ||
      appointments < 1 ||
      !Number.isInteger(orderItems) ||
      orderItems < 1
    ) {
      return;
    }
    await patchPlatform({
      maxAppointmentsPerBusiness: appointments,
      maxOrderItemsPerOrder: orderItems,
    });
  }

  async function toggleSignups() {
    await patchPlatform({ signupsEnabled: !signupsEnabled });
  }

  async function toggleTrialClosure() {
    await patchPlatform({ trialClosureEnabled: !trialClosureEnabled });
  }

  async function toggleTrialWarnings() {
    await patchPlatform({
      trialWarningEmailsEnabled: !trialWarningEmailsEnabled,
    });
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
    if (authenticated) {
      void loadBusinesses();
      void loadIncidents();
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    const timer = window.setInterval(() => void loadIncidents(), 20_000);
    return () => window.clearInterval(timer);
  }, [authenticated]);

  async function logout() {
    await fetch("/api/master/logout", { method: "POST" });
    setAuthenticated(false);
    setBusinesses([]);
  }

  function ensureOwnerEmailDraft(b: BusinessRow) {
    setOwnerEmailDrafts((prev) =>
      prev[b.id] !== undefined ? prev : { ...prev, [b.id]: b.owner.email }
    );
  }

  async function patchOwnerCredentials(
    b: BusinessRow,
    patch: { email?: string; password?: string }
  ) {
    setOwnerCredSavingId(b.id);
    setOwnerCredFeedback((prev) => {
      const next = { ...prev };
      delete next[b.id];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/users/${b.owner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setOwnerCredFeedback((prev) => ({
          ...prev,
          [b.id]: {
            tone: "error",
            text: data.error ?? "עדכון נכשל",
          },
        }));
        return;
      }
      if (patch.password) {
        setOwnerPasswordDrafts((prev) => ({ ...prev, [b.id]: "" }));
      }
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: {
          tone: "success",
          text: data.message ?? "עודכן בהצלחה",
        },
      }));
      await loadBusinesses();
    } catch {
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "שגיאת רשת" },
      }));
    } finally {
      setOwnerCredSavingId(null);
    }
  }

  async function saveOwnerEmail(b: BusinessRow) {
    const email = (ownerEmailDrafts[b.id] ?? "").trim().toLowerCase();
    if (!email) {
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "נא להזין מייל" },
      }));
      return;
    }
    if (email === b.owner.email.toLowerCase()) {
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "המייל זהה לקיים" },
      }));
      return;
    }
    await patchOwnerCredentials(b, { email });
  }

  async function saveOwnerPassword(b: BusinessRow) {
    const password = ownerPasswordDrafts[b.id] ?? "";
    if (password.length < 8) {
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "סיסמה: לפחות 8 תווים" },
      }));
      return;
    }
    if (!confirm("לעדכן סיסמה למוכר? הוא יצטרך להתחבר עם הסיסמה החדשה.")) {
      return;
    }
    await patchOwnerCredentials(b, { password });
  }

  async function enterOwnerDashboard(b: BusinessRow) {
    if (
      !confirm(
        `להיכנס לדשבורד של "${b.name}" כמוכר? תועבר/י לדשבורד החנות.`
      )
    ) {
      return;
    }

    setImpersonatingId(b.id);
    setOwnerCredFeedback((prev) => {
      const next = { ...prev };
      delete next[b.id];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/users/${b.owner.id}/impersonate`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setOwnerCredFeedback((prev) => ({
          ...prev,
          [b.id]: {
            tone: "error",
            text: data.error ?? "כניסה נכשלה",
          },
        }));
        return;
      }
      window.location.href = data.redirectTo ?? "/dashboard";
    } catch {
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "שגיאת רשת" },
      }));
    } finally {
      setImpersonatingId(null);
    }
  }

  async function sendOwnerMessage(b: BusinessRow) {
    const text = (ownerMessageDrafts[b.id] ?? "").trim();
    if (!text) {
      setOwnerMessageFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "כתוב הודעה לפני השליחה" },
      }));
      return;
    }

    setOwnerMessageSendingId(b.id);
    setOwnerMessageFeedback((prev) => {
      const next = { ...prev };
      delete next[b.id];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/businesses/${b.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setOwnerMessageFeedback((prev) => ({
          ...prev,
          [b.id]: {
            tone: "error",
            text: data.error ?? "שליחה נכשלה",
          },
        }));
        return;
      }
      setOwnerMessageDrafts((prev) => ({ ...prev, [b.id]: "" }));
      setOwnerMessageFeedback((prev) => ({
        ...prev,
        [b.id]: {
          tone: "success",
          text: data.message ?? "ההודעה נשלחה",
        },
      }));
    } catch {
      setOwnerMessageFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "error", text: "שגיאת רשת" },
      }));
    } finally {
      setOwnerMessageSendingId(null);
    }
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
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      if (expandedId === id) setExpandedId(null);
      loadBusinesses();
      return;
    }
    alert(data.error ?? "לא ניתן למחוק את החנות. נסו שוב או בדקו תקלות מערכת בפאנל.");
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
        <div className="master-surface px-4 py-20 text-center text-bakery-muted">
          טוען...
        </div>
      </WebShell>
    );
  }

  if (!authenticated) {
    return <MasterLoginGate />;
  }

  const activeCount = businesses.filter((b) => b.isActive).length;
  const pendingApproval = businesses.filter((b) => !b.isActive && !b.approvedAt);
  const trialNow = Date.now();
  void trialClock;
  const trialsEndingSoon = businesses.filter((b) => {
    const trial = trialStatusForBusiness(b, trialNow);
    return !trial.hasSubscription && !trial.expired && trial.daysRemaining <= 7;
  }).length;
  const trialsExpired = businesses.filter((b) => {
    const trial = trialStatusForBusiness(b, trialNow);
    return !trial.hasSubscription && trial.expired;
  }).length;

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
      <div className="master-surface mx-auto max-w-3xl space-y-4 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8 md:px-[14px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <PageTitle>ניהול חנויות</PageTitle>
          <Button variant="ghost" onClick={logout}>
            יציאה
          </Button>
        </div>

        <MasterOuter>
          <MasterInner>
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
                className="master-panel-input py-3 pe-4 ps-11"
                dir="auto"
              />
            </label>
            {searchQuery.trim() && (
              <p className="mt-2 text-[13px] font-semibold text-bakery-muted">
                {filteredStores.length} חנויות · {filteredPendingOwners.length} חשבונות בלי חנות
              </p>
            )}
          </MasterInner>
        </MasterOuter>

        <MasterOuter
          className={incidents.length > 0 ? "master-panel-outer--error" : ""}
        >
          <MasterInner>
            <button
              type="button"
              onClick={() => setIncidentsOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 text-start"
            >
            <div>
              <p className="text-[16px] font-extrabold text-bakery-ink">
                תקלות מערכת (למתכנת בלבד)
              </p>
              <p className="mt-1 text-[13px] text-bakery-muted">
                {incidents.length > 0
                  ? `${incidents.length} תקלות אחרונות — הלקוחות רואים רק הודעה כללית`
                  : "אין תקלות מתועדות כרגע"}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform ${
                incidentsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {incidentsOpen && incidents.length > 0 && (
            <div className="mt-3 space-y-2">
              {incidents.map((incident) => (
                <MasterInner
                  key={incident.id}
                  className="master-panel-inner--error text-start"
                >
                  <p className="text-[12px] font-bold text-bakery-muted">
                    {new Date(incident.at).toLocaleString("he-IL")} · {incident.context}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-bakery-ink">
                    מה שהמשתמש ראה: {incident.publicMessage}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-bakery-error">
                    {incident.developerMessage}
                  </p>
                  {incident.stack ? (
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-[10px] bg-bakery-ink/5 p-2 font-mono text-[11px] text-bakery-muted">
                      {incident.stack}
                    </pre>
                  ) : null}
                </MasterInner>
              ))}
              <Button variant="ghost" onClick={clearIncidents} className="w-full">
                נקה רשימת תקלות
              </Button>
            </div>
          )}
          </MasterInner>
        </MasterOuter>

        <MasterOuter>
          <MasterInner className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
              className={`w-full sm:w-auto ${signupsEnabled ? "master-btn-matte-danger" : ""}`}
            >
              {platformLoading
                ? "שומר..."
                : signupsEnabled
                  ? "השעה הרשמה"
                  : "פתח הרשמה"}
            </Button>
          </MasterInner>
        </MasterOuter>

        <MasterOuter>
          <MasterInner className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[16px] font-extrabold text-bakery-ink">
                סגירת חנות אחרי {BUSINESS_TRIAL_DAYS} יום ניסיון
              </p>
              <p className="mt-1 text-[14px] text-bakery-muted">
                {trialClosureEnabled
                  ? "חנות ללא מנוי תיסגר אוטומטית בסוף תקופת הניסיון"
                  : "הניסיון לא ייסגר אוטומטית — החנות נשארת פתוחה"}
              </p>
            </div>
            <Button
              variant={trialClosureEnabled ? "danger" : "primary"}
              onClick={() => void toggleTrialClosure()}
              disabled={platformLoading}
              className={`w-full sm:w-auto ${trialClosureEnabled ? "master-btn-matte-danger" : ""}`}
            >
              {platformLoading
                ? "שומר..."
                : trialClosureEnabled
                  ? "כבה סגירה אוטומטית"
                  : "הפעל סגירה אוטומטית"}
            </Button>
          </MasterInner>
        </MasterOuter>

        <MasterOuter>
          <MasterInner>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[16px] font-extrabold text-bakery-ink">
                  התראות לפני סיום ניסיון
                </p>
                <p className="mt-1 text-[14px] text-bakery-muted">
                  {trialWarningEmailsEnabled
                    ? trialWarningScheduleLabelHe()
                    : "לא נשלחות התראות במייל או בדחיפה למוכרים"}
                </p>
              </div>
              <Button
                variant={trialWarningEmailsEnabled ? "danger" : "primary"}
                onClick={() => void toggleTrialWarnings()}
                disabled={platformLoading || !trialClosureEnabled}
                className={`w-full sm:w-auto ${trialWarningEmailsEnabled ? "master-btn-matte-warn" : ""}`}
              >
                {platformLoading
                  ? "שומר..."
                  : trialWarningEmailsEnabled
                    ? "כבה התראות"
                    : "הפעל התראות"}
              </Button>
            </div>
            {!trialClosureEnabled ? (
              <p className="mt-3 text-[13px] text-bakery-muted">
                התראות רלוונטיות רק כשסגירה אוטומטית מופעלת.
              </p>
            ) : null}
          </MasterInner>
        </MasterOuter>

        <MasterOuter>
          <MasterInner className="space-y-4">
            <div>
              <p className="text-[16px] font-extrabold text-bakery-ink">
                מגבלות קביעת תורים והזמנות
              </p>
              <p className="mt-1 text-[14px] text-bakery-muted">
                מכסה לכל חנות ומגבלת פריטים בהזמנה אחת — חל על כל העסקים בפלטפורמה
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="מקסימום תורים לחנות"
                type="number"
                min={1}
                max={100000}
                value={maxAppointmentsPerBusiness}
                onChange={(e) =>
                  setMaxAppointmentsPerBusiness(Number(e.target.value) || 0)
                }
                dir="ltr"
              />
              <Input
                label="מקסימום פריטים בהזמנה"
                type="number"
                min={1}
                max={100000}
                value={maxOrderItemsPerOrder}
                onChange={(e) =>
                  setMaxOrderItemsPerOrder(Number(e.target.value) || 0)
                }
                dir="ltr"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => void savePlatformLimits()}
              disabled={platformLoading}
              className="w-full sm:w-auto"
            >
              {platformLoading ? "שומר..." : "שמור מגבלות"}
            </Button>
          </MasterInner>
        </MasterOuter>

        <MasterOuter>
          <MasterInner className="space-y-2">
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
            <p className="text-[14px] text-bakery-ink">
              ניסיון {BUSINESS_TRIAL_DAYS} יום:{" "}
              <span className="font-extrabold text-bakery-sale">
                {trialsEndingSoon}
              </span>{" "}
              נגמרות בשבוע הקרוב ·{" "}
              <span className="font-extrabold text-bakery-error">{trialsExpired}</span>{" "}
              כבר נגמרו
            </p>
          </MasterInner>
        </MasterOuter>

        {filteredPendingOwners.map((u) => (
          <MasterOuter key={u.id} className="master-panel-outer--tight">
            <MasterInner className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
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
            </MasterInner>
          </MasterOuter>
        ))}

        {filteredStores.map((b) => {
          const status = storeStatus(b);
          const trial = trialStatusForBusiness(b, trialNow);
          const trialBadge = trialBadgeMeta(trial);
          const expanded = expandedId === b.id;
          const suspendLabel = approveLabel(b);
          const isSuspendAction = b.isActive;

          return (
            <MasterOuter key={b.id} className="master-panel-outer--tight space-y-2">
              <button
                type="button"
                onClick={() => {
                  const next = expanded ? null : b.id;
                  setExpandedId(next);
                  if (next) ensureOwnerEmailDraft(b);
                }}
                className={`master-panel-inner master-panel-row${
                  expanded ? " master-panel-inner--active" : ""
                }`}
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
                    <Badge tone={trialBadge.tone}>{trialBadge.label}</Badge>
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
                <div className="space-y-2">
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
                      {b.owner.phone && (
                        <p dir="ltr" className="font-mono text-[13px]">
                          {b.owner.phone}
                        </p>
                      )}
                    </DetailBox>

                    <DetailBox title="ניהול חשבון מוכר">
                      <Input
                        label="מייל"
                        type="email"
                        dir="ltr"
                        autoComplete="off"
                        value={ownerEmailDrafts[b.id] ?? b.owner.email}
                        onChange={(e) =>
                          setOwnerEmailDrafts((prev) => ({
                            ...prev,
                            [b.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-2 w-full sm:w-auto"
                        disabled={ownerCredSavingId === b.id}
                        onClick={() => void saveOwnerEmail(b)}
                      >
                        {ownerCredSavingId === b.id ? "שומר..." : "שמור מייל"}
                      </Button>

                      <Input
                        label="סיסמה חדשה"
                        type="password"
                        dir="ltr"
                        autoComplete="new-password"
                        className="mt-3"
                        value={ownerPasswordDrafts[b.id] ?? ""}
                        onChange={(e) =>
                          setOwnerPasswordDrafts((prev) => ({
                            ...prev,
                            [b.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-2 w-full sm:w-auto"
                        disabled={ownerCredSavingId === b.id}
                        onClick={() => void saveOwnerPassword(b)}
                      >
                        {ownerCredSavingId === b.id ? "שומר..." : "עדכן סיסמה"}
                      </Button>

                      {ownerCredFeedback[b.id] ? (
                        <div className="mt-2">
                          <Alert variant={ownerCredFeedback[b.id].tone}>
                            {ownerCredFeedback[b.id].text}
                          </Alert>
                        </div>
                      ) : null}

                      <Button
                        type="button"
                        variant="primary"
                        className="mt-4 w-full"
                        disabled={impersonatingId === b.id}
                        onClick={() => void enterOwnerDashboard(b)}
                      >
                        {impersonatingId === b.id
                          ? "נכנס..."
                          : "כניסה לדשבורד החנות"}
                      </Button>
                      <p className="mt-2 text-[12px] text-bakery-muted">
                        נכנס כמוכר — גם אם החנות מושבתת או שהניסיון נגמר.
                      </p>
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

                  <DetailBox title={`ניסיון ${BUSINESS_TRIAL_DAYS} יום`}>
                    <p className="text-[15px] font-extrabold text-bakery-ink">
                      {formatTrialCountdown(trial)}
                    </p>
                    {!trial.hasSubscription ? (
                      <p className="mt-1 text-bakery-muted">
                        <span className="font-bold text-bakery-ink">
                          החנות נעצרת:
                        </span>{" "}
                        {trial.trialEndsAt.toLocaleString("he-IL")}
                      </p>
                    ) : (
                      <p className="mt-1 text-bakery-muted">
                        מנוי מאז{" "}
                        {b.subscriptionActiveAt
                          ? new Date(b.subscriptionActiveAt).toLocaleString("he-IL")
                          : "—"}
                        {b.subscriptionPlan ? ` · ${b.subscriptionPlan}` : ""}
                      </p>
                    )}
                    <p className="mt-1 text-[13px] text-bakery-muted">
                      הספירה מתחילה ממועד פתיחת החנות (
                      {new Date(b.createdAt).toLocaleDateString("he-IL")})
                    </p>
                  </DetailBox>

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
                          className="master-panel-stat"
                        >
                          <p className="text-[11px] font-bold text-bakery-muted">{label}</p>
                          <p className="text-[18px] font-extrabold text-bakery-ink">{count}</p>
                        </div>
                      ))}
                    </div>
                  </DetailBox>

                  <MasterInner>
                    <Link
                      href={`/b/${b.slug}`}
                      target="_blank"
                      className="text-[14px] font-bold text-bakery-primary hover:underline"
                    >
                      צפייה בעמוד לקוחות →
                    </Link>
                  </MasterInner>

                  <DetailBox title="הודעה לחנות">
                    <p className="text-[13px] text-bakery-muted">
                      ההודעה תופיע למוכר/ת בדשבורד החנות — לא במייל.
                    </p>
                    <Textarea
                      className="mt-2 min-h-[96px]"
                      rows={4}
                      maxLength={2000}
                      placeholder="כתוב הודעה שתופיע בדשבורד של המוכר/ת..."
                      value={ownerMessageDrafts[b.id] ?? ""}
                      onChange={(e) =>
                        setOwnerMessageDrafts((prev) => ({
                          ...prev,
                          [b.id]: e.target.value,
                        }))
                      }
                    />
                    {ownerMessageFeedback[b.id] ? (
                      <div className="mt-2">
                        <Alert variant={ownerMessageFeedback[b.id].tone}>
                          {ownerMessageFeedback[b.id].text}
                        </Alert>
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full sm:w-auto"
                      disabled={ownerMessageSendingId === b.id}
                      onClick={() => void sendOwnerMessage(b)}
                    >
                      {ownerMessageSendingId === b.id
                        ? "שולח..."
                        : "שלח הודעה לחנות"}
                    </Button>
                  </DetailBox>

                  <MasterInner className="flex flex-col gap-2 sm:flex-row">
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
                  </MasterInner>
                </div>
              )}
            </MasterOuter>
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
