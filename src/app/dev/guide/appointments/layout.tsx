import { DevGuidePreview } from "@/components/dashboard/dev-guide-preview";

export default function DevGuideAppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DevGuidePreview
      businessType="APPOINTMENTS"
      title="תצוגה מקדימה — מדריך חנות פגישות"
      basePath="/dev/guide/appointments"
      storageId="dev-guide-preview-appointments"
    >
      {children}
    </DevGuidePreview>
  );
}
