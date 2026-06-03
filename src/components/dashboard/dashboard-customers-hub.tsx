"use client";

import { Megaphone, MessagesSquare } from "lucide-react";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";

export function DashboardCustomersHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <div className="space-y-5 pb-2 text-center">
      <div>
        <h1 className="text-[22px] font-extrabold text-bakery-ink">לקוחות</h1>
        <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
          הודעות לכל החנות ומענה לפניות
        </p>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DashboardActionSquare
            href={`${basePath}/customers/broadcast`}
            icon={Megaphone}
            label="הודעה ללקוחות"
          />
          <DashboardActionSquare
            href={`${basePath}/customers/inquiries`}
            icon={MessagesSquare}
            label="פניות לקוחות"
          />
        </div>
      </div>
    </div>
  );
}
