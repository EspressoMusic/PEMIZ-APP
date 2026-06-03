import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { ChevronLeft } from "lucide-react";

export default function DevSellerProductsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <div className="space-y-4">
            <Link
              href="/dev/seller/actions"
              className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              חזרה לפעולות
            </Link>
            <ProductsManager />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
