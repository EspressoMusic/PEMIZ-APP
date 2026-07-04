import type { Metadata } from "next";
import { PaddleCheckoutClient } from "@/components/paddle/paddle-checkout-client";
import { getPaddleCheckoutPageProps } from "@/lib/paddle-client-config";

export const metadata: Metadata = {
  title: "Checkout — Peymiz",
  robots: { index: false, follow: false },
};

export default function PaddleCheckoutPage() {
  const props = getPaddleCheckoutPageProps();
  return (
    <div className="dashboard-surface bakery-frame-bg min-h-dvh">
      <PaddleCheckoutClient {...props} />
    </div>
  );
}
