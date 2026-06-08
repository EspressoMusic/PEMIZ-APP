import { DevGuidePreview } from "@/components/dashboard/dev-guide-preview";

export default function DevGuidePreviewPage() {
  return (
    <DevGuidePreview
      businessType="STORE"
      title="תצוגה מקדימה — מדריך חנות מוצרים"
      basePath="/dev/seller"
      storageId="dev-guide-preview-store"
    />
  );
}
