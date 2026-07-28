"use client";

import { useEffect, useState } from "react";
import { OrderCheckoutModal } from "@/components/customer/order-checkout-modal";

// Mirrors STORE_INACTIVE_MESSAGE_HE in src/lib/subscription-usage.ts —
// duplicated here (not imported) because that module pulls in Prisma,
// which can't be bundled into this client component.
const STORE_INACTIVE_MESSAGE_HE = "החנות אינה פעילה כעת.";

/**
 * Shows exactly what the customer sees if they go through checkout after the
 * seller's trial has ended — same error box the "store closed for ordering
 * hours" case already uses, surfaced only at the moment of ordering, not
 * while just browsing.
 */
export default function DevOrdersClosedCheckoutPreviewPage() {
  // CustomerCenterModal portals its content — same as DashboardTrialEndedModal,
  // it must start closed and open in an effect so the first client render
  // still matches the server-rendered markup (no `open` prop hydration mismatch).
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <div className="bakery-frame-bg flex h-dvh items-center justify-center overflow-hidden">
      <OrderCheckoutModal
        open={open}
        onClose={() => {}}
        locale="he"
        total={99}
        initialName=""
        initialPhone=""
        onSubmit={() => {}}
        submitting={false}
        error={STORE_INACTIVE_MESSAGE_HE}
      />
    </div>
  );
}
