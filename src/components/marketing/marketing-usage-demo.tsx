"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Info, Send, X } from "lucide-react";
import { useMarketingLocale } from "./marketing-locale-provider";

const UNIT1 = 45;
const ORDER_QTY = 2;

const STR = {
  he: {
    storeName: "מאפיית תמר",
    dashboardSub: "דאשבורד",
    product1Name: "עוגיות שוקולד צ'יפס",
    completeOrder: "השלמת קניה",
    cancelOrder: "ביטול",
    checkoutTitle: "פרטים להשלמת ההזמנה",
    fieldNameLabel: "שם",
    fieldPhoneLabel: "טלפון",
    totalWord: 'סה"כ',
    submitIdle: "אישור הזמנה",
    submitSending: "שולח…",
    successTitle: "ההזמנה נשלחה",
    successDetail:
      "המוכר עדיין צריך לאשר אותה — נעדכן אתכם ברגע שהיא תאושר.",
    closeBtn: "סגור",
    approvedTitle: "ההזמנה אושרה!",
    approvedDetail: "המוכר אישר את ההזמנה ויתחיל בהכנה.",
    greatBtn: "מעולה",
    nudgeLine: "יש הזמנה חדשה שמחכה לאישור",
    notifChip: "הזמנה חדשה",
    rejectBtn: "דחיית הזמנה",
    confirmBtn: "אישור הזמנה",
    confirmedChip: "אושר",
    phoneCaptionCustomer: "לקוח",
    phoneCaptionSeller: "מוכר",
    customerName: "נועה כהן",
    customerInitial: "נ",
    toSellerLabel: "ההזמנה בדרך…",
    toCustomerLabel: "האישור בדרך…",
  },
  en: {
    storeName: "Tamar's Bakery",
    dashboardSub: "Dashboard",
    product1Name: "Chocolate Chip Cookies",
    completeOrder: "Complete purchase",
    cancelOrder: "Cancel",
    checkoutTitle: "Complete your order",
    fieldNameLabel: "Name",
    fieldPhoneLabel: "Phone",
    totalWord: "Total",
    submitIdle: "Confirm order",
    submitSending: "Sending…",
    successTitle: "Order sent!",
    successDetail:
      "The seller still needs to confirm it — we'll let you know once it's approved.",
    closeBtn: "Close",
    approvedTitle: "Order approved!",
    approvedDetail: "The seller confirmed your order and will prepare it soon.",
    greatBtn: "Great",
    nudgeLine: "A new order is waiting for approval",
    notifChip: "New order",
    rejectBtn: "Reject order",
    confirmBtn: "Confirm order",
    confirmedChip: "Confirmed",
    phoneCaptionCustomer: "Customer",
    phoneCaptionSeller: "Seller",
    customerName: "Noa Cohen",
    customerInitial: "N",
    toSellerLabel: "Order on its way…",
    toCustomerLabel: "Confirmation on its way…",
  },
} as const;

const CAPTIONS: { he: string; en: string }[] = [
  { he: "הלקוח מעיין בתפריט של החנות", en: "The customer browses the store's menu" },
  { he: "מוסיף מוצר לסל הקניות", en: "Adds a product to the cart" },
  { he: "מגדיל את הכמות ל-2", en: "Increases the quantity to 2" },
  { he: "ממלא שם וטלפון ומאשר את ההזמנה", en: "Fills in name and phone and confirms the order" },
  { he: "שולח את ההזמנה…", en: "Sending the order…" },
  { he: "ההזמנה נשלחת מיידית למוכר", en: "The order reaches the seller instantly" },
  { he: "המוכר מקבל התראה על הזמנה חדשה", en: "The seller gets notified of a new order" },
  { he: "פותח את ההתראה ורואה את ההזמנה", en: "Opens the notification and views the order" },
  { he: "בודק את המוצרים ואת הסכום לתשלום", en: "Checks the items and the amount due" },
  { he: "מאשר את ההזמנה בלחיצת כפתור", en: "Confirms the order with one tap" },
  { he: "הלקוח מקבל התראה שההזמנה אושרה", en: "The customer is notified the order was approved" },
  { he: "ומהתחלה…", en: "…and back to the start" },
];

type Attrs = {
  cart: number;
  cartbar: "hidden" | "shown";
  modal: "none" | "checkout" | "sending" | "success" | "approved";
  formstate: "idle" | "sending";
  connector: "idle" | "to-seller" | "to-customer";
  bell: "idle" | "alert";
  nudge: "hidden" | "shown";
  panel: "none" | "compact" | "expanded" | "confirming" | "confirmed";
};

const INITIAL: Attrs = {
  cart: 0,
  cartbar: "hidden",
  modal: "none",
  formstate: "idle",
  connector: "idle",
  bell: "idle",
  nudge: "hidden",
  panel: "none",
};

const STEPS: { dur: number; attrs: Partial<Attrs> }[] = [
  { dur: 1100, attrs: { cart: 0, cartbar: "hidden", modal: "none", formstate: "idle", connector: "idle", bell: "idle", nudge: "hidden", panel: "none" } },
  { dur: 750, attrs: { cart: 1, cartbar: "shown" } },
  { dur: 750, attrs: { cart: 2 } },
  { dur: 1600, attrs: { modal: "checkout" } },
  { dur: 650, attrs: { formstate: "sending" } },
  { dur: 1500, attrs: { modal: "success", connector: "to-seller" } },
  { dur: 1100, attrs: { connector: "idle", bell: "alert", nudge: "shown" } },
  { dur: 1300, attrs: { panel: "compact" } },
  { dur: 1500, attrs: { panel: "expanded" } },
  { dur: 750, attrs: { panel: "confirming" } },
  { dur: 1700, attrs: { panel: "confirmed", bell: "idle", nudge: "hidden", connector: "to-customer", modal: "approved" } },
  { dur: 1300, attrs: { connector: "idle" } },
];

const CONFETTI = [
  { left: 6, w: 6, h: 9, color: "#e6d4b8", delay: 0, dur: 1.5 },
  { left: 16, w: 7, h: 10, color: "#6d4c41", delay: 0.15, dur: 1.7 },
  { left: 26, w: 6, h: 9, color: "#43a047", delay: 0.05, dur: 1.4 },
  { left: 37, w: 8, h: 11, color: "#b94040", delay: 0.25, dur: 1.8 },
  { left: 48, w: 6, h: 9, color: "#7eb8ff", delay: 0.1, dur: 1.5 },
  { left: 58, w: 7, h: 10, color: "#f4f0e8", delay: 0.3, dur: 1.6 },
  { left: 68, w: 6, h: 9, color: "#e6d4b8", delay: 0.18, dur: 1.9 },
  { left: 78, w: 7, h: 10, color: "#43a047", delay: 0.02, dur: 1.4 },
  { left: 88, w: 6, h: 9, color: "#b94040", delay: 0.22, dur: 1.7 },
  { left: 94, w: 7, h: 10, color: "#6d4c41", delay: 0.08, dur: 1.6 },
];

function money(amount: number, side: "customer" | "dashboard", locale: "he" | "en") {
  const v = amount.toFixed(2);
  if (side === "customer") return locale === "he" ? v : `$${v}`;
  return locale === "he" ? `₪${v}` : `$${v}`;
}

function Confetti() {
  return (
    <div className="usage-demo-confetti" aria-hidden="true">
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className="usage-demo-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export function MarketingUsageDemo() {
  const { locale } = useMarketingLocale();
  const t = STR[locale === "en" ? "en" : "he"];
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [attrs, setAttrs] = useState<Attrs>(INITIAL);
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let index = 0;
    function run(i: number) {
      const step = STEPS[i];
      setPhaseIndex(i);
      setAttrs((prev) => ({ ...prev, ...step.attrs }));
      if (step.attrs.cart !== undefined) {
        setPulse(false);
        requestAnimationFrame(() => setPulse(true));
      }
      timerRef.current = setTimeout(() => {
        index = (i + 1) % STEPS.length;
        run(index);
      }, step.dur);
    }
    run(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [locale]);

  const orderTotal = ORDER_QTY * UNIT1;
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <div className="usage-demo" dir={dir}>
      <div className="usage-demo-phones">
        <div className="usage-demo-phone-col">
        <p className="usage-demo-phone-title">{t.phoneCaptionCustomer}</p>
        <div className="usage-demo-phone" aria-label={t.phoneCaptionCustomer}>
          <div className="usage-demo-notch" />
          <div className="usage-demo-statusbar">
            <span dir="ltr">9:41</span>
            <span className="usage-demo-status-dots">●●●</span>
          </div>
          <div className="usage-demo-screen" dir={dir}>
            <div className="usage-demo-store-header">
              <div className="usage-demo-store-avatar">🥐</div>
              <div className="usage-demo-store-name">{t.storeName}</div>
            </div>

            <div className="usage-demo-product-grid">
              <div className="usage-demo-product-card">
                <div className="usage-demo-product-image">🍪</div>
                <div className="usage-demo-product-name-row">
                  <span className="usage-demo-product-name">{t.product1Name}</span>
                  <span className="usage-demo-info-btn" aria-hidden="true">
                    <Info size={11} strokeWidth={2} />
                  </span>
                </div>
                <div className="usage-demo-product-price-row">
                  <span className="usage-demo-product-price">{money(UNIT1, "customer", locale)}</span>
                  <div className="usage-demo-stepper">
                    <span className="usage-demo-stepper-btn">–</span>
                    <span className={`usage-demo-qty-value${pulse ? " is-pulsing" : ""}`}>{attrs.cart}</span>
                    <span className="usage-demo-stepper-btn">+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`usage-demo-cart-bar${attrs.cartbar === "shown" ? " is-shown" : ""}`}>
              <button type="button" className="usage-demo-cart-cta" tabIndex={-1}>
                <span>{t.completeOrder}</span>
                <span>({attrs.cart})</span>
                <span>{money(attrs.cart * UNIT1, "customer", locale)}</span>
              </button>
              <span className="usage-demo-cart-cancel">{t.cancelOrder}</span>
            </div>

            <div className={`usage-demo-modal-overlay${attrs.modal !== "none" ? " is-open" : ""}`}>
              {attrs.modal === "checkout" && (
                <div className="usage-demo-modal">
                  <h3>{t.checkoutTitle}</h3>
                  <div className="usage-demo-order-line">
                    <span>{t.product1Name} ×{ORDER_QTY}</span>
                    <span>{money(orderTotal, "customer", locale)}</span>
                  </div>
                  <div className="usage-demo-total-pill">
                    {t.totalWord}: {money(orderTotal, "customer", locale)}
                  </div>
                  <div className="usage-demo-field">
                    <span>{t.fieldNameLabel}</span>
                    <span className="usage-demo-field-value">{t.customerName}</span>
                  </div>
                  <div className="usage-demo-field">
                    <span>{t.fieldPhoneLabel}</span>
                    <span className="usage-demo-field-value" dir="ltr">050-1234567</span>
                  </div>
                  <button type="button" className="usage-demo-submit-btn" tabIndex={-1}>
                    {attrs.formstate === "sending" ? (
                      <>
                        <span className="usage-demo-spin" />
                        {t.submitSending}
                      </>
                    ) : (
                      t.submitIdle
                    )}
                  </button>
                </div>
              )}

              {attrs.modal === "success" && (
                <div className="usage-demo-modal">
                  <div className="usage-demo-celebration">
                    <Confetti />
                    <div className="usage-demo-celebration-badge">
                      <Send size={22} strokeWidth={2} />
                    </div>
                    <h3>{t.successTitle}</h3>
                    <p>{t.successDetail}</p>
                    <button type="button" className="usage-demo-celebration-btn" tabIndex={-1}>
                      {t.closeBtn}
                    </button>
                  </div>
                </div>
              )}

              {attrs.modal === "approved" && (
                <div className="usage-demo-modal">
                  <div className="usage-demo-celebration">
                    <Confetti />
                    <div className="usage-demo-celebration-badge is-approved">
                      <Check size={22} strokeWidth={2.4} />
                    </div>
                    <h3>{t.approvedTitle}</h3>
                    <p>{t.approvedDetail}</p>
                    <button type="button" className="usage-demo-celebration-btn" tabIndex={-1}>
                      {t.greatBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="usage-demo-phone-caption">{t.phoneCaptionCustomer}</p>
        </div>
        </div>

        <div className="usage-demo-connector">
          <div className="usage-demo-connector-line" />
          {attrs.connector !== "idle" && (
            <div
              className={`usage-demo-connector-dot is-${attrs.connector}`}
              key={`${phaseIndex}-${attrs.connector}`}
            />
          )}
          {attrs.connector === "to-seller" && (
            <span className="usage-demo-connector-label">{t.toSellerLabel}</span>
          )}
          {attrs.connector === "to-customer" && (
            <span className="usage-demo-connector-label">{t.toCustomerLabel}</span>
          )}
        </div>

        <div className="usage-demo-phone-col">
        <p className="usage-demo-phone-title">{t.phoneCaptionSeller}</p>
        <div className="usage-demo-phone" aria-label={t.phoneCaptionSeller}>
          <div className="usage-demo-notch" />
          <div className="usage-demo-statusbar">
            <span dir="ltr">9:41</span>
            <span className="usage-demo-status-dots">●●●</span>
          </div>
          <div className="usage-demo-screen" dir={dir}>
            <div className="usage-demo-seller-header">
              <div>
                <div className="usage-demo-store-name">{t.storeName}</div>
                <div className="usage-demo-seller-sub">{t.dashboardSub}</div>
              </div>
              <button
                type="button"
                className={`usage-demo-bell-btn${attrs.bell === "alert" ? " is-alert" : ""}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <Bell size={18} strokeWidth={2} />
                <span className="usage-demo-bell-dot" />
              </button>
            </div>
            <div className={`usage-demo-nudge-line${attrs.nudge === "shown" ? " is-shown" : ""}`}>
              {t.nudgeLine}
            </div>
            <div className="usage-demo-ghost-row">
              <div className="usage-demo-ghost-tile" />
              <div className="usage-demo-ghost-tile" />
              <div className="usage-demo-ghost-tile usage-demo-ghost-tile--wide" />
            </div>

            <div className={`usage-demo-notif-panel${attrs.panel !== "none" ? " is-open" : ""}`}>
              {attrs.panel === "compact" && (
                <div className="usage-demo-notif-compact">
                  <span className="usage-demo-notif-chip">{t.notifChip}</span>
                  <div className="usage-demo-notif-preview">
                    <span>{t.customerName} · {t.product1Name} ×{ORDER_QTY}</span>
                    <span>{money(orderTotal, "dashboard", locale)}</span>
                  </div>
                  <span className="usage-demo-notif-time">9:41</span>
                </div>
              )}

              {(attrs.panel === "expanded" || attrs.panel === "confirming") && (
                <div className="usage-demo-order-detail">
                  <div className="usage-demo-order-detail-head">
                    <div className="usage-demo-avatar">{t.customerInitial}</div>
                    <div>
                      <div className="usage-demo-customer-name">{t.customerName}</div>
                      <div className="usage-demo-order-time">9:41</div>
                    </div>
                  </div>
                  <div className="usage-demo-order-item">
                    <div className="usage-demo-item-thumb">
                      🍪
                      <span className="usage-demo-item-qty-badge">×{ORDER_QTY}</span>
                    </div>
                    <span className="usage-demo-item-name">{t.product1Name}</span>
                  </div>
                  <div className="usage-demo-order-total-row">
                    <span>{t.totalWord}</span>
                    <span>{money(orderTotal, "dashboard", locale)}</span>
                  </div>
                  <div className="usage-demo-order-actions">
                    <button type="button" className="usage-demo-reject-btn" tabIndex={-1}>
                      <X size={12} strokeWidth={2.4} />
                      {t.rejectBtn}
                    </button>
                    <button
                      type="button"
                      className={`usage-demo-confirm-btn${attrs.panel === "confirming" ? " is-confirming" : ""}`}
                      tabIndex={-1}
                    >
                      <Check size={12} strokeWidth={2.4} />
                      {t.confirmBtn}
                    </button>
                  </div>
                </div>
              )}

              {attrs.panel === "confirmed" && (
                <div className="usage-demo-confirmed-chip">
                  <Check size={13} strokeWidth={2.4} />
                  <span>{t.confirmedChip}</span>
                </div>
              )}
            </div>
          </div>
          <p className="usage-demo-phone-caption">{t.phoneCaptionSeller}</p>
        </div>
        </div>
      </div>

      <p className="usage-demo-caption">{CAPTIONS[phaseIndex][locale === "en" ? "en" : "he"]}</p>
    </div>
  );
}
