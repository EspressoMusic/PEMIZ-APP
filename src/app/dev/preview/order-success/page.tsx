"use client";

import { CelebrationModal } from "@/components/celebration-modal";
import { getCustomerLabels } from "@/components/customer/customer-labels";

export default function DevOrderSuccessPreviewPage() {
  const labels = getCustomerLabels("he");

  return (
    <div className="bakery-frame-bg flex h-dvh items-center justify-center p-4">
      <CelebrationModal
        open
        onClose={() => {}}
        title={labels.orderSuccessTitle}
        detail={labels.orderSuccessDetail}
        buttonLabel={labels.great}
        closeAriaLabel={labels.close}
        locale="he"
      />
    </div>
  );
}
