import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTitle } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

export default function DevSellerFaqPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <div className="space-y-4 text-center">
            <Link
              href="/dev/seller/actions"
              className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              חזרה לפעולות
            </Link>
            <PageTitle>שאלות ותשובות</PageTitle>
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
