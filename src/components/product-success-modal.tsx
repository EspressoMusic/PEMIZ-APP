"use client";

import { CelebrationModal } from "@/components/celebration-modal";

export function ProductSuccessModal({
  open,
  productName,
  onClose,
  title,
  detail,
  buttonLabel = "מעולה",
  closeAriaLabel = "סגור",
}: {
  open: boolean;
  productName: string;
  onClose: () => void;
  title?: string;
  detail?: string;
  buttonLabel?: string;
  closeAriaLabel?: string;
}) {
  return (
    <CelebrationModal
      open={open}
      onClose={onClose}
      title={title ?? "המוצר נוסף בהצלחה!"}
      subtitle={productName || undefined}
      detail={detail ?? "הלקוחות יכולים לראות אותו בעמוד החנות"}
      buttonLabel={buttonLabel}
      closeAriaLabel={closeAriaLabel}
    />
  );
}
