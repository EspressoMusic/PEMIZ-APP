import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";
import { ChevronLeft } from "lucide-react";

export default async function DashboardCustomersPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/actions"
        className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        חזרה לפעולות
      </Link>
      <DashboardCustomersHub />
    </div>
  );
}
