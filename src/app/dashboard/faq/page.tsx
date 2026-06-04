import { FaqManager } from "@/components/faq-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import {
  DASHBOARD_PAGE_ROOT,
  DashboardSellerPageStack,
} from "@/components/dashboard/dashboard-panel-frame";

export default function DashboardFaqPage() {
  return (
    <DashboardSellerPageStack className={DASHBOARD_PAGE_ROOT}>
      <DashboardCustomersBackLink />
      <FaqManager />
    </DashboardSellerPageStack>
  );
}
