"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Clock,
  Home,
  LogOut,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { Alert, Button, Badge, Textarea, Input } from "@/components/ui";
import { MasterLoginGate } from "@/components/master-login-gate";
import { WebShell } from "@/components/web-shell";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import {
  DASHBOARD_MOBILE_STACK,
  DASHBOARD_PAGE_ROOT,
} from "@/components/dashboard/dashboard-panel-frame";
import {
  DASHBOARD_PRESSABLE_CLASS,
  getDashboardPressProps,
} from "@/lib/dashboard-press";
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

function businessInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : "?";
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

function storeStatus(b: BusinessRow) {
  if (b.isActive) return { label: "פעיל", tone: "success" as const };
  if (!b.approvedAt) return { label: "ממתין לאישור", tone: "warning" as const };
  return { label: "מושבת", tone: "danger" as const };
}

/** מלבן חנות — כמו שורת הזמנה בדשבורד המוכר (עיגול אות ראשונה + שם + תגיות) */
function BusinessRowCard({
  business,
  onClick,
}: {
  business: BusinessRow;
  onClick: () => void;
}) {
  const status = storeStatus(business);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${DASHBOARD_PRESSABLE_CLASS} dashboard-action-square dashboard-order-row flex w-full cursor-pointer items-center gap-3 rounded-[22px] px-3 py-3.5 text-start`}
      {...getDashboardPressProps<HTMLButtonElement>()}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
        aria-hidden
      >
        {businessInitial(business.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-extrabold leading-tight text-bakery-ink">
          {business.name}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Badge tone={status.tone}>{status.label}</Badge>
          <Badge>{business.type === "STORE" ? "חנות" : "תורים"}</Badge>
        </span>
      </span>
    </button>
  );
}

export function MasterPanel({
  previewOnly = false,
  initialBusinesses = [],
  initialPendingOwners = [],
}: {
  previewOnly?: boolean;
  initialBusinesses?: BusinessRow[];
  initialPendingOwners?: PendingOwner[];
} = {}) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(
    previewOnly ? true : null
  );
  const [activeTab, setActiveTab] = useState<"home" | "actions">("home");
  const [businesses, setBusinesses] = useState<BusinessRow[]>(initialBusinesses);
  const [pendingOwners, setPendingOwners] =
    useState<PendingOwner[]>(initialPendingOwners);
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
  const [incidentsOpen, setIncidentsOpen] = useState(false);
  const [signupsSheetOpen, setSignupsSheetOpen] = useState(false);
  const [trialClosureSheetOpen, setTrialClosureSheetOpen] = useState(false);
  const [trialWarningsSheetOpen, setTrialWarningsSheetOpen] = useState(false);
  const [limitsSheetOpen, setLimitsSheetOpen] = useState(false);
  const [statsSheetOpen, setStatsSheetOpen] = useState(false);
  const [pendingOwnersSheetOpen, setPendingOwnersSheetOpen] = useState(false);
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
    if (previewOnly) {
      setIncidents([]);
      return;
    }
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
    if (previewOnly) {
      setPlatformLoading(true);
      if (typeof patch.signupsEnabled === "boolean") {
        setSignupsEnabled(patch.signupsEnabled);
      }
      if (typeof patch.trialClosureEnabled === "boolean") {
        setTrialClosureEnabled(patch.trialClosureEnabled);
      }
      if (typeof patch.trialWarningEmailsEnabled === "boolean") {
        setTrialWarningEmailsEnabled(patch.trialWarningEmailsEnabled);
      }
      if (typeof patch.maxAppointmentsPerBusiness === "number") {
        setMaxAppointmentsPerBusiness(patch.maxAppointmentsPerBusiness);
      }
      if (typeof patch.maxOrderItemsPerOrder === "number") {
        setMaxOrderItemsPerOrder(patch.maxOrderItemsPerOrder);
      }
      setPlatformLoading(false);
      return;
    }
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
    if (previewOnly) {
      setPendingOwners((prev) => prev.filter((u) => u.id !== id));
      return;
    }
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) loadBusinesses();
  }

  useEffect(() => {
    if (previewOnly) return;
    checkAuth();
  }, [previewOnly]);

  useEffect(() => {
    if (previewOnly || !authenticated) return;
    void loadBusinesses();
    void loadIncidents();
  }, [authenticated, previewOnly]);

  useEffect(() => {
    if (previewOnly || !authenticated) return;
    const timer = window.setInterval(() => void loadIncidents(), 20_000);
    return () => window.clearInterval(timer);
  }, [authenticated, previewOnly]);

  async function logout() {
    if (previewOnly) return;
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

    if (previewOnly) {
      if (patch.password) {
        setOwnerPasswordDrafts((prev) => ({ ...prev, [b.id]: "" }));
      }
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "success", text: "תצוגה מקדימה — לא נשמר בפועל" },
      }));
      setOwnerCredSavingId(null);
      return;
    }

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

    if (previewOnly) {
      setOwnerCredFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "success", text: "תצוגה מקדימה — אין דשבורד אמיתי" },
      }));
      setImpersonatingId(null);
      return;
    }

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

    if (previewOnly) {
      setOwnerMessageDrafts((prev) => ({ ...prev, [b.id]: "" }));
      setOwnerMessageFeedback((prev) => ({
        ...prev,
        [b.id]: { tone: "success", text: "תצוגה מקדימה — לא נשלח בפועל" },
      }));
      setOwnerMessageSendingId(null);
      return;
    }

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
    if (previewOnly) {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !isActive } : b))
      );
      return;
    }
    await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    loadBusinesses();
  }

  async function removeStore(id: string, name: string) {
    if (!confirm(`למחוק את החנות "${name}"? פעולה זו בלתי הפיכה.`)) return;
    if (previewOnly) {
      if (expandedId === id) setExpandedId(null);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      return;
    }
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

  const detailBusiness = businesses.find((b) => b.id === expandedId) ?? null;

  function renderBusinessDetail(b: BusinessRow) {
    const trial = trialStatusForBusiness(b, trialNow);
    const trialBadge = trialBadgeMeta(trial);
    const suspendLabel = approveLabel(b);
    const isSuspendAction = b.isActive;

    return (
      <div className="space-y-2 px-3 pb-4 text-start sm:px-4">
        <div className="flex flex-wrap items-center gap-2 px-1">
          <Badge tone={storeStatus(b).tone}>{storeStatus(b).label}</Badge>
          <Badge tone={trialBadge.tone}>{trialBadge.label}</Badge>
          <Badge>{b.type === "STORE" ? "חנות" : "תורים"}</Badge>
        </div>
        <p
          className="truncate px-1 font-mono text-[13px] text-bakery-primary"
          dir="ltr"
        >
          {b.publicUrl}
        </p>

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
              {impersonatingId === b.id ? "נכנס..." : "כניסה לדשבורד החנות"}
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
              <span className="font-bold text-bakery-ink">החנות נעצרת:</span>{" "}
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
              <div key={label} className="master-panel-stat">
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
            {ownerMessageSendingId === b.id ? "שולח..." : "שלח הודעה לחנות"}
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
    );
  }

  function openDetail(b: BusinessRow) {
    ensureOwnerEmailDraft(b);
    setExpandedId(b.id);
  }

  return (
    <WebShell>
      <div className={`master-surface ${DASHBOARD_PAGE_ROOT} h-[100dvh]`}>
        <div className="min-h-0 flex-1 overflow-y-auto pb-24">
          {activeTab === "home" ? (
            <div className={`${DASHBOARD_MOBILE_STACK} space-y-2 px-3 py-3 text-center sm:py-4`}>
              <div className="dashboard-home-header dashboard-home-header--greeting relative flex flex-col items-center justify-center px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIncidentsOpen(true)}
                  className="dashboard-icon-tile-dark absolute end-3 top-3 z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition hover:opacity-95"
                  aria-label="תקלות מערכת"
                >
                  <span className="relative text-[20px]" aria-hidden>
                    🔔
                  </span>
                  {incidents.length > 0 ? (
                    <span
                      className="dashboard-inquiry-dot dashboard-inquiry-dot--dark-tile"
                      aria-hidden
                    />
                  ) : null}
                </button>
                <h1 className="w-full truncate px-14 text-center text-[18px] font-extrabold leading-tight text-bakery-ink sm:text-[19px]">
                  שלום, מנהל המערכת!
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
                  {pendingApproval.length > 0
                    ? `${pendingApproval.length} חנויות ממתינות לאישור שלך`
                    : "אין חנויות ממתינות לאישור"}
                </p>
              </div>

              <div className="dashboard-card bakery-float-panel rounded-[32px] p-3 text-start">
                <label className="relative mb-2 block">
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
                {filteredStores.length === 0 ? (
                  <p className="py-8 text-center text-[14px] font-semibold text-bakery-muted">
                    {searchQuery.trim()
                      ? "לא נמצאו תוצאות לחיפוש."
                      : "אין חנויות רשומות במערכת."}
                  </p>
                ) : (
                  <ul className="w-full space-y-2">
                    {filteredStores.map((b) => (
                      <li key={b.id}>
                        <BusinessRowCard business={b} onClick={() => openDetail(b)} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className={`${DASHBOARD_MOBILE_STACK} space-y-3 px-3 py-3 sm:py-4`}>
              <h2 className="px-1 text-[19px] font-extrabold text-bakery-ink">הגדרות פלטפורמה</h2>

              <div className="dashboard-card bakery-float-panel rounded-[32px] p-3 text-start">
                <ul className="space-y-2">
                  <DashboardActionRowButton
                    icon={AlertTriangle}
                    title="תקלות מערכת (למתכנת בלבד)"
                    subtitle={
                      incidents.length > 0
                        ? `${incidents.length} תקלות אחרונות — הלקוחות רואים רק הודעה כללית`
                        : "אין תקלות מתועדות כרגע"
                    }
                    trailing={
                      incidents.length > 0 ? (
                        <Badge tone="danger">{incidents.length}</Badge>
                      ) : undefined
                    }
                    onClick={() => setIncidentsOpen(true)}
                  />
                  <DashboardActionRowButton
                    icon={UserPlus}
                    title="הרשמה חדשה לאתר"
                    subtitle={signupsEnabled ? "פתוחה להרשמה" : "סגורה להרשמה"}
                    onClick={() => setSignupsSheetOpen(true)}
                  />
                  <DashboardActionRowButton
                    icon={Clock}
                    title={`סגירת חנות אחרי ${BUSINESS_TRIAL_DAYS} יום ניסיון`}
                    subtitle={trialClosureEnabled ? "מופעלת" : "כבויה"}
                    onClick={() => setTrialClosureSheetOpen(true)}
                  />
                  <DashboardActionRowButton
                    icon={Bell}
                    title="התראות לפני סיום ניסיון"
                    subtitle={trialWarningEmailsEnabled ? "מופעלות" : "כבויות"}
                    onClick={() => setTrialWarningsSheetOpen(true)}
                  />
                  <DashboardActionRowButton
                    icon={SlidersHorizontal}
                    title="מגבלות קביעת תורים והזמנות"
                    subtitle={`עד ${maxAppointmentsPerBusiness} תורים · עד ${maxOrderItemsPerOrder} פריטים`}
                    onClick={() => setLimitsSheetOpen(true)}
                  />
                  <DashboardActionRowButton
                    icon={BarChart3}
                    title="סטטיסטיקות פלטפורמה"
                    subtitle={`${businesses.length} חנויות · ${activeCount} פעילות · ${pendingApproval.length} ממתינות`}
                    onClick={() => setStatsSheetOpen(true)}
                  />
                  {pendingOwners.length > 0 ? (
                    <DashboardActionRowButton
                      icon={Users}
                      title="חשבונות בלי חנות"
                      subtitle={`${pendingOwners.length} חשבונות`}
                      onClick={() => setPendingOwnersSheetOpen(true)}
                    />
                  ) : null}
                  <DashboardActionRowButton icon={LogOut} title="יציאה" onClick={logout} />
                </ul>
              </div>
            </div>
          )}
        </div>

        <nav
          className="dashboard-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-bakery-card"
          style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
          aria-label="ניווט פאנל מתכנת"
        >
          <div className={`flex w-full pt-2 ${DASHBOARD_MOBILE_STACK} px-4`}>
            {(
              [
                { key: "home" as const, label: "בית", icon: Home },
                { key: "actions" as const, label: "הגדרות", icon: Zap },
              ]
            ).map((l) => {
              const active = activeTab === l.key;
              const Icon = l.icon;
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setActiveTab(l.key)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-1 flex-col items-center rounded-full px-2 py-2 transition ${
                    active ? "dashboard-bottom-nav__link--active" : ""
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${active ? "text-bakery-ink" : "text-bakery-muted"}`}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span
                    className={`mt-1 text-center text-[11px] font-bold leading-tight ${
                      active ? "text-bakery-ink" : "text-bakery-muted"
                    }`}
                  >
                    {l.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* מודל תקלות מערכת */}
      <DashboardActionSheet
        open={incidentsOpen}
        onClose={() => setIncidentsOpen(false)}
        title="תקלות מערכת"
        ariaLabel="תקלות מערכת"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-2 text-start">
          {incidents.length === 0 ? (
            <p className="py-8 text-center text-[14px] font-semibold text-bakery-muted">
              אין תקלות מתועדות כרגע
            </p>
          ) : (
            <>
              {incidents.map((incident) => (
                <MasterInner key={incident.id} className="master-panel-inner--error">
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
            </>
          )}
        </div>
      </DashboardActionSheet>

      {/* הרשמה חדשה לאתר */}
      <DashboardActionSheet
        open={signupsSheetOpen}
        onClose={() => setSignupsSheetOpen(false)}
        title="הרשמה חדשה לאתר"
        ariaLabel="הרשמה חדשה לאתר"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-3 text-start">
          <p className="text-[14px] text-bakery-muted">
            {signupsEnabled
              ? "משתמשים יכולים להירשם ולפתוח חנות"
              : "ההרשמה סגורה — רק התחברות לחשבונות קיימים"}
          </p>
          <Button
            variant={signupsEnabled ? "danger" : "primary"}
            onClick={toggleSignups}
            disabled={platformLoading}
            className={`w-full ${signupsEnabled ? "master-btn-matte-danger" : ""}`}
          >
            {platformLoading
              ? "שומר..."
              : signupsEnabled
                ? "השעה הרשמה"
                : "פתח הרשמה"}
          </Button>
        </div>
      </DashboardActionSheet>

      {/* סגירת חנות אחרי תקופת ניסיון */}
      <DashboardActionSheet
        open={trialClosureSheetOpen}
        onClose={() => setTrialClosureSheetOpen(false)}
        title={`סגירת חנות אחרי ${BUSINESS_TRIAL_DAYS} יום ניסיון`}
        ariaLabel="סגירת חנות אחרי תקופת ניסיון"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-3 text-start">
          <p className="text-[14px] text-bakery-muted">
            {trialClosureEnabled
              ? "חנות ללא מנוי תיסגר אוטומטית בסוף תקופת הניסיון"
              : "הניסיון לא ייסגר אוטומטית — החנות נשארת פתוחה"}
          </p>
          <Button
            variant={trialClosureEnabled ? "danger" : "primary"}
            onClick={() => void toggleTrialClosure()}
            disabled={platformLoading}
            className={`w-full ${trialClosureEnabled ? "master-btn-matte-danger" : ""}`}
          >
            {platformLoading
              ? "שומר..."
              : trialClosureEnabled
                ? "כבה סגירה אוטומטית"
                : "הפעל סגירה אוטומטית"}
          </Button>
        </div>
      </DashboardActionSheet>

      {/* התראות לפני סיום ניסיון */}
      <DashboardActionSheet
        open={trialWarningsSheetOpen}
        onClose={() => setTrialWarningsSheetOpen(false)}
        title="התראות לפני סיום ניסיון"
        ariaLabel="התראות לפני סיום ניסיון"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-3 text-start">
          <p className="text-[14px] text-bakery-muted">
            {trialWarningEmailsEnabled
              ? trialWarningScheduleLabelHe()
              : "לא נשלחות התראות במייל או בדחיפה למוכרים"}
          </p>
          <Button
            variant={trialWarningEmailsEnabled ? "danger" : "primary"}
            onClick={() => void toggleTrialWarnings()}
            disabled={platformLoading || !trialClosureEnabled}
            className={`w-full ${trialWarningEmailsEnabled ? "master-btn-matte-warn" : ""}`}
          >
            {platformLoading
              ? "שומר..."
              : trialWarningEmailsEnabled
                ? "כבה התראות"
                : "הפעל התראות"}
          </Button>
          {!trialClosureEnabled ? (
            <p className="text-[13px] text-bakery-muted">
              התראות רלוונטיות רק כשסגירה אוטומטית מופעלת.
            </p>
          ) : null}
        </div>
      </DashboardActionSheet>

      {/* מגבלות קביעת תורים והזמנות */}
      <DashboardActionSheet
        open={limitsSheetOpen}
        onClose={() => setLimitsSheetOpen(false)}
        title="מגבלות קביעת תורים והזמנות"
        ariaLabel="מגבלות קביעת תורים והזמנות"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-4 text-start">
          <p className="text-[14px] text-bakery-muted">
            מכסה לכל חנות ומגבלת פריטים בהזמנה אחת — חל על כל העסקים בפלטפורמה
          </p>
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
            className="w-full"
          >
            {platformLoading ? "שומר..." : "שמור מגבלות"}
          </Button>
        </div>
      </DashboardActionSheet>

      {/* סטטיסטיקות פלטפורמה */}
      <DashboardActionSheet
        open={statsSheetOpen}
        onClose={() => setStatsSheetOpen(false)}
        title="סטטיסטיקות פלטפורמה"
        ariaLabel="סטטיסטיקות פלטפורמה"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-2 text-start">
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
        </div>
      </DashboardActionSheet>

      {/* חשבונות בלי חנות */}
      <DashboardActionSheet
        open={pendingOwnersSheetOpen}
        onClose={() => setPendingOwnersSheetOpen(false)}
        title="חשבונות בלי חנות"
        ariaLabel="חשבונות בלי חנות"
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        <div className="space-y-2 text-start">
          {pendingOwners.map((u) => (
            <div
              key={u.id}
              className="master-panel-inner flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1 text-start">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[16px] font-extrabold text-bakery-ink">{u.name}</p>
                  <Badge tone="warning">בלי חנות</Badge>
                </div>
                <p dir="ltr" className="font-mono text-[13px] text-bakery-primary">
                  {u.email}
                </p>
                <p className="text-[12px] text-bakery-muted">
                  נרשם/ה: {new Date(u.createdAt).toLocaleString("he-IL")}
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
          ))}
        </div>
      </DashboardActionSheet>

      {/* פרטי חנות */}
      <DashboardActionSheet
        open={detailBusiness !== null}
        onClose={() => setExpandedId(null)}
        title={detailBusiness?.name}
        ariaLabel={detailBusiness?.name ?? "פרטי חנות"}
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="dashboard-order-schedule-sheet master-action-sheet-panel"
        backdropClassName="master-action-sheet-backdrop"
      >
        {detailBusiness ? renderBusinessDetail(detailBusiness) : null}
      </DashboardActionSheet>
    </WebShell>
  );
}
