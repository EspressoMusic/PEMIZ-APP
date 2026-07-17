"use client";

import { BellRing, Send } from "lucide-react";
import { CelebrationModal } from "@/components/celebration-modal";
import { Button } from "@/components/ui";
import { getCustomerLabels } from "@/components/customer/customer-labels";

export default function DevOrderPendingPreviewPage() {
  const labels = getCustomerLabels("he");

  return (
    <div className="customer-store-root customer-theme-turquoise bakery-frame-bg flex h-dvh items-center justify-center p-4">
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
        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2 rounded-full text-[14px] font-extrabold text-bakery-primary"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bakery-primary) 18%, var(--bakery-card))",
            borderWidth: "2.5px",
            borderColor: "var(--bakery-primary)",
          }}
        >
          <BellRing className="h-4 w-4" strokeWidth={2} />
          {labels.orderNotifyMeButton}
        </Button>
      </CelebrationModal>
    </div>
  );
}
