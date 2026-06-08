import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardStoreBroadcast } from "@/components/dashboard/dashboard-store-broadcast";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersBroadcastPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardStoreBroadcast
          previewOnly
          initialMessage={DEV_APPOINTMENTS_BUSINESS.storeBroadcast ?? ""}
          initialSentAt={DEV_APPOINTMENTS_BUSINESS.storeBroadcastAt ?? null}
          initialHistory={DEV_APPOINTMENTS_BUSINESS.storeBroadcastHistory ?? []}
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
