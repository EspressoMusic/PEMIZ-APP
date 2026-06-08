import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessTrialExpired } from "@/lib/business-trial";
import { syncBusinessTrialLock } from "@/lib/business-subscription";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.business) {
    await syncBusinessTrialLock(user.business);
    if (isBusinessTrialExpired(user.business)) {
      redirect("/trial-expired");
    }
    redirect("/dashboard");
  }

  return children;
}
