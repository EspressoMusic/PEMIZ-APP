import { DashboardInquiriesManager } from "@/components/dashboard/dashboard-inquiries-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_SELLER_BASE,
  DEV_PREVIEW_INQUIRIES,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsInquiriesPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardInquiriesManager
          previewOnly
          initialItems={DEV_PREVIEW_INQUIRIES}
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
