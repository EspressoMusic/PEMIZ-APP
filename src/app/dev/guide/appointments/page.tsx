import { DevGuidePreview } from "@/components/dashboard/dev-guide-preview";

export default function DevAppointmentsGuidePreviewPage() {
  return (
    <DevGuidePreview
      businessType="APPOINTMENTS"
      title="תצוגה מקדימה — מדריך חנות פגישות"
      basePath="/dev/seller-appointments"
      storageId="dev-guide-preview-appointments"
    />
  );
}
