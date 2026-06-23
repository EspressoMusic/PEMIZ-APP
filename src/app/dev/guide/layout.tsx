import {
  DASHBOARD_LAYOUT_BODY,
  DASHBOARD_LAYOUT_FRAME,
} from "@/components/dashboard/dashboard-panel-frame";

export default function DevGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className={DASHBOARD_LAYOUT_FRAME}>
        <div className={DASHBOARD_LAYOUT_BODY}>{children}</div>
      </div>
    </div>
  );
}
