import type { Metadata } from "next";
import { SubscriptionPreviewDemo } from "@/components/dashboard/subscription-preview-demo";

export const metadata: Metadata = {
  title: "Subscription preview — Peymiz",
  robots: { index: false, follow: false },
};

export default function PreviewSubscriptionPage() {
  return <SubscriptionPreviewDemo />;
}
