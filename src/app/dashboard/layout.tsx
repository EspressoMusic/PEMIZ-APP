import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { studioConsolePath } from "@/lib/studio-access";
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
    if (user.role === "ADMIN") {
      const consolePath = studioConsolePath();
      redirect(consolePath || "/");
    }
    redirect("/onboarding");
  }

  if (await activateLegacyPendingBusiness(user.business.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4 lg:px-[14px]">
        <DashboardShell
          businessType={user.business.type}
          storeLocale={user.business.storeLocale}
          storeTheme={user.business.storeTheme}
        >
          {children}
        </DashboardShell>
      </div>
    </div>
  );
}
