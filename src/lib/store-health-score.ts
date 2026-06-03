export type StoreHealthDeductionKind =
  | "unanswered_inquiry"
  | "bad_review";

export type StoreHealthDeduction = {
  id: string;
  kind: StoreHealthDeductionKind;
  label: string;
  detail: string;
  penaltyPercent: number;
  href?: string;
};

export type StoreHealthSnapshot = {
  percent: number;
  deductions: StoreHealthDeduction[];
};

const PENALTY = {
  unanswered_inquiry: 10,
  bad_review: 15,
} as const;

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function computeStoreHealthScore(
  deductions: StoreHealthDeduction[]
): StoreHealthSnapshot {
  const totalPenalty = deductions.reduce((s, d) => s + d.penaltyPercent, 0);
  const percent = Math.max(0, Math.min(100, 100 - totalPenalty));
  return { percent, deductions };
}

export function deductionsFromUnansweredInquiries(
  inquiries: {
    id: string;
    customerName: string;
    message: string;
  }[],
  inquiriesHref: string
): StoreHealthDeduction[] {
  return inquiries.map((q) => ({
    id: `inquiry-${q.id}`,
    kind: "unanswered_inquiry",
    label: "פנייה ללא מענה",
    detail: `${q.customerName}: ${truncate(q.message, 72)}`,
    penaltyPercent: PENALTY.unanswered_inquiry,
    href: inquiriesHref,
  }));
}

export function deductionsFromBadReviews(
  reviews: {
    id: string;
    customerName: string;
    rating: number;
    comment?: string | null;
  }[]
): StoreHealthDeduction[] {
  return reviews
    .filter((r) => r.rating <= 2)
    .map((r) => ({
      id: `review-${r.id}`,
      kind: "bad_review" as const,
      label: "ביקורת שלילית",
      detail: r.comment?.trim()
        ? `${r.customerName} (${r.rating} כוכבים): ${truncate(r.comment, 64)}`
        : `${r.customerName} דירג/ה ${r.rating} כוכבים`,
      penaltyPercent: PENALTY.bad_review,
    }));
}

export function mergeStoreHealthInputs(
  parts: StoreHealthDeduction[][]
): StoreHealthSnapshot {
  return computeStoreHealthScore(parts.flat());
}
