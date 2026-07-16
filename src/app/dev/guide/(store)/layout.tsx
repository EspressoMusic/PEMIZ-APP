import { DevGuidePreview } from "@/components/dashboard/dev-guide-preview";

export default function DevGuideStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DevGuidePreview
      businessType="STORE"
      title="תצוגה מקדימה — מדריך חנות מוצרים"
      basePath="/dev/guide"
      storageId="dev-guide-preview-store"
    >
      {children}
    </DevGuidePreview>
  );
}
