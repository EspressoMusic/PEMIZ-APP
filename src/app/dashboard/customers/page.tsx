import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChevronLeft, Receipt, MessagesSquare, CalendarCheck } from "lucide-react";
import { PageTitle } from "@/components/ui";

export default async function DashboardCustomersPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const isStore = user.business.type === "STORE";

  return (
    <div className="space-y-5 pb-2">
      <Link
        href="/dashboard/actions"
        className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        חזרה לפעולות
      </Link>

      <PageTitle>לקוחות</PageTitle>

      <ul className="space-y-3">
        {isStore && (
          <li>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 rounded-[22px] bg-[#e3d3b8] px-3 py-3.5 shadow-[0_3px_10px_rgba(58,47,38,0.1)]"
            >
              <Receipt className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
              <span className="flex-1 text-[16px] font-extrabold text-bakery-ink">הזמנות</span>
              <ChevronLeft className="h-6 w-6 text-bakery-muted rtl:rotate-180" />
            </Link>
          </li>
        )}
        {!isStore && (
          <li>
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-3 rounded-[22px] bg-[#e3d3b8] px-3 py-3.5 shadow-[0_3px_10px_rgba(58,47,38,0.1)]"
            >
              <CalendarCheck className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
              <span className="flex-1 text-[16px] font-extrabold text-bakery-ink">תורים</span>
              <ChevronLeft className="h-6 w-6 text-bakery-muted rtl:rotate-180" />
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/dashboard/inquiries"
            className="flex items-center gap-3 rounded-[22px] bg-[#e3d3b8] px-3 py-3.5 shadow-[0_3px_10px_rgba(58,47,38,0.1)]"
          >
            <MessagesSquare className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
            <span className="flex-1 text-[16px] font-extrabold text-bakery-ink">פניות</span>
            <ChevronLeft className="h-6 w-6 text-bakery-muted rtl:rotate-180" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
