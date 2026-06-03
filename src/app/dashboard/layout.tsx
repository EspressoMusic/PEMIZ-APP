import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { activateLegacyPendingBusiness } from "@/lib/business";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.business) {
    if (user.role === "ADMIN") redirect("/master");
    redirect("/onboarding");
  }

  if (await activateLegacyPendingBusiness(user.business.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="bakery-frame-bg">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType={user.business.type}>
          {children}
        </DashboardShell>
      </div>
    </div>
  );
}
