"use client";

import { useState } from "react";
import Image from "next/image";
import { BellRing, Check, Send } from "lucide-react";
import { CelebrationModal } from "@/components/celebration-modal";
import { Alert, Button } from "@/components/ui";
import { getCustomerLabels } from "@/components/customer/customer-labels";
import { formatCustomerOrderDate } from "@/lib/customer-order-history";
import {
  customerOrderStatusLabel,
  customerOrderStatusToneClass,
} from "@/lib/order-status-label";

const BUSINESS_NAME = "מאפיית לינקי";

type Step = "pending" | "subscribed" | "push" | "history";

const STEPS: { id: Step; label: string }[] = [
  { id: "pending", label: "1 · ההזמנה נשלחה" },
  { id: "subscribed", label: "2 · נרשמו להתראה" },
  { id: "push", label: "3 · המוכר אישר" },
  { id: "history", label: "4 · היסטוריה" },
];

export default function DevOrderStatusFlowPreviewPage() {
  const labels = getCustomerLabels("he");
  const [step, setStep] = useState<Step>("pending");

  return (
    <div className="customer-store-root customer-theme-turquoise bakery-frame-bg min-h-dvh" dir="rtl">
      <nav className="fixed inset-x-0 top-0 z-[90] flex flex-wrap justify-center gap-2 bg-bakery-ink/70 p-3 backdrop-blur-md">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`rounded-full px-4 py-2 text-[13px] font-extrabold transition ${
              step === s.id
                ? "bg-bakery-primary text-white"
                : "bg-bakery-cream-light/90 text-bakery-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {step === "pending" || step === "subscribed" ? (
        <CelebrationModal
          open
          onClose={() => {}}
          title={labels.orderPendingTitle}
          detail={labels.orderPendingDetail}
          buttonLabel={labels.close}
          closeAriaLabel={labels.close}
          locale="he"
          icon={<Send className="h-7 w-7" strokeWidth={2} />}
        >
          {step === "pending" ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 rounded-full text-[14px] font-extrabold text-bakery-primary"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--bakery-primary) 18%, var(--bakery-card))",
                borderWidth: "2.5px",
                borderColor: "var(--bakery-primary)",
              }}
            >
              <BellRing className="h-4 w-4" strokeWidth={2} />
              {labels.orderNotifyMeButton}
            </Button>
          ) : (
            <Alert
              variant="success"
              className="flex items-center justify-center gap-2 rounded-full text-center text-[13px] font-bold"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              {labels.orderNotifySubscribed}
            </Alert>
          )}
        </CelebrationModal>
      ) : null}

      {step === "push" ? (
        <div className="flex min-h-dvh items-center justify-center p-4 pt-24">
          <div className="w-full max-w-sm space-y-3">
            <p className="text-center text-[12px] font-bold text-bakery-muted">
              ההתראה שנשלחת למכשיר הלקוח כשהמוכר לוחץ &quot;אשר&quot;
            </p>
            <div className="flex items-start gap-3 rounded-[20px] border-[1.2px] border-bakery-border/40 bg-bakery-cream-light p-3.5 shadow-[0_12px_40px_rgba(58,47,38,0.28)]">
              <Image
                src="/icons/notification-icon.png"
                alt=""
                width={40}
                height={40}
                priority
                className="mt-0.5 shrink-0 rounded-[10px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold leading-tight text-bakery-ink">
                  ההזמנה שלך אושרה!
                </p>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-bakery-muted">
                  {BUSINESS_NAME}
                </p>
              </div>
              <span className="mt-0.5 shrink-0 text-[11px] font-bold text-bakery-muted">
                עכשיו
              </span>
            </div>
            <p className="text-center text-[12px] font-semibold text-bakery-muted">
              לחיצה על ההתראה פותחת את החנות
            </p>
          </div>
        </div>
      ) : null}

      {step === "history" ? (
        <div className="flex min-h-dvh items-center justify-center p-4 pt-24">
          <div className="w-full max-w-sm rounded-[24px] bg-bakery-cream-light p-4 shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
            <h2 className="mb-3 text-center text-[16px] font-extrabold text-bakery-ink">
              {labels.orderHistory}
            </h2>
            <p className="mb-2 text-center text-[12px] font-bold text-bakery-muted">
              {labels.orderHistoryOnThisDevice}
            </p>
            <ul className="space-y-2">
              {(["PENDING", "CONFIRMED"] as const).map((status, i) => (
                <li
                  key={status}
                  className="w-full rounded-[18px] border-[2px] border-bakery-primary bg-bakery-square px-3 py-3 text-start"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-bold text-bakery-muted">
                      {formatCustomerOrderDate(
                        new Date(Date.now() - i * 86_400_000).toISOString(),
                        "he"
                      )}
                    </span>
                    <span
                      className={`text-[13px] font-extrabold ${customerOrderStatusToneClass(status)}`}
                    >
                      {customerOrderStatusLabel(status, "he")}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-bakery-muted">
                    {labels.orderNumber} #{101 - i}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-center text-[12px] font-semibold text-bakery-muted">
              {labels.orderHistorySignInForDetails}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
