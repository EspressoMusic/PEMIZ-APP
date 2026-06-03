"use client";

import { CelebrationModal } from "@/components/celebration-modal";

export function ProductSuccessModal({
  open,
  productName,
  onClose,
}: {
  open: boolean;
  productName: string;
  onClose: () => void;
}) {
  return (
    <CelebrationModal
      open={open}
      onClose={onClose}
      title="המוצר נוסף בהצלחה!"
      subtitle={productName || undefined}
      detail="הלקוחות יכולים לראות אותו בעמוד החנות"
      buttonLabel="מעולה"
      closeAriaLabel="סגור"
    />
  );
}
