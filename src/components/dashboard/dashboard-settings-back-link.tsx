import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function DashboardSettingsBackLink({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <Link
      href={`${basePath}/settings`}
      className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
    >
      <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      חזרה לחנות
    </Link>
  );
}
