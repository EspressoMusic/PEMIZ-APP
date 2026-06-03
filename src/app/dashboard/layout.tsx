import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

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
  return (
    <div className="bakery-frame-bg min-h-full">
    <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-4 py-8 md:flex-row md:px-[14px]">
      {user.business && (
        <DashboardNav businessType={user.business.type} />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
    </div>
  );
}
