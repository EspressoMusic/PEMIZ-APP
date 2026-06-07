export type AppointmentCancelUnit = "hours" | "days";

export type AppointmentCancelPolicy = {
  enabled: boolean;
  unit: AppointmentCancelUnit;
  amount: number;
};

const DEFAULT_POLICY: AppointmentCancelPolicy = {
  enabled: false,
  unit: "hours",
  amount: 24,
};

export function parseAppointmentCancelPolicy(
  storeTerms: string | null | undefined
): AppointmentCancelPolicy {
  if (!storeTerms?.trim()) return { ...DEFAULT_POLICY };

  const text = storeTerms.trim();

  if (
    /לא ניתן לבטל תור|cannot be cancelled in the app|cannot cancel in the app/i.test(
      text
    )
  ) {
    return { enabled: false, unit: "hours", amount: 24 };
  }

  const heDays = text.match(/(\d+)\s*ימים?\s*לפני/);
  if (heDays) {
    return {
      enabled: true,
      unit: "days",
      amount: Math.max(1, parseInt(heDays[1], 10)),
    };
  }
  const enDays = text.match(/(\d+)\s*days?\s*before/i);
  if (enDays) {
    return {
      enabled: true,
      unit: "days",
      amount: Math.max(1, parseInt(enDays[1], 10)),
    };
  }

  const heHours = text.match(/(\d+)\s*שעות?\s*לפני/);
  if (heHours) {
    return {
      enabled: true,
      unit: "hours",
      amount: Math.max(1, parseInt(heHours[1], 10)),
    };
  }
  const enHours = text.match(/(\d+)\s*hours?\s*before/i);
  if (enHours) {
    return {
      enabled: true,
      unit: "hours",
      amount: Math.max(1, parseInt(enHours[1], 10)),
    };
  }

  return { ...DEFAULT_POLICY };
}

export function buildAppointmentCancelStoreTerms(
  policy: AppointmentCancelPolicy,
  locale: "he" | "en"
): string {
  if (!policy.enabled) {
    return locale === "he"
      ? "לא ניתן לבטל תור באפליקציה — יש לפנות לחנות."
      : "Appointments cannot be cancelled in the app — contact the store.";
  }

  const n = Math.max(1, Math.round(policy.amount));
  if (policy.unit === "days") {
    return locale === "he"
      ? `ביטול תור עד ${n} ${n === 1 ? "יום" : "ימים"} לפני המועד.`
      : `Cancel up to ${n} day${n === 1 ? "" : "s"} before the appointment.`;
  }

  return locale === "he"
    ? `ביטול תור עד ${n} שעות לפני המועד.`
    : `Cancel up to ${n} hours before the appointment.`;
}

export function formatAppointmentCancelSummary(
  policy: AppointmentCancelPolicy,
  locale: "he" | "en"
): string {
  if (!policy.enabled) {
    return locale === "he"
      ? "הלקוח לא יכול לבטל תור מהאפליקציה"
      : "Customers cannot cancel from the app";
  }

  const n = policy.amount;
  if (policy.unit === "days") {
    return locale === "he"
      ? `ביטול עד ${n} ${n === 1 ? "יום" : "ימים"} לפני התור`
      : `Cancel up to ${n} day${n === 1 ? "" : "s"} before`;
  }

  return locale === "he"
    ? `ביטול עד ${n} שעות לפני התור`
    : `Cancel up to ${n} hours before`;
}

function cancelPolicyToMs(policy: AppointmentCancelPolicy): number {
  if (policy.unit === "days") {
    return policy.amount * 24 * 60 * 60 * 1000;
  }
  return policy.amount * 60 * 60 * 1000;
}

export function canCustomerCancelAppointment(
  startAt: string,
  policy: AppointmentCancelPolicy,
  status: string
): boolean {
  if (status === "CANCELLED") return false;
  if (!policy.enabled) return false;
  const msUntil = new Date(startAt).getTime() - Date.now();
  return msUntil >= cancelPolicyToMs(policy);
}

/** @deprecated Use parseAppointmentCancelPolicy */
export function parseAppointmentCancelHours(
  storeTerms: string | null | undefined
): number {
  const policy = parseAppointmentCancelPolicy(storeTerms);
  if (!policy.enabled) return 0;
  if (policy.unit === "days") return policy.amount * 24;
  return policy.amount;
}
