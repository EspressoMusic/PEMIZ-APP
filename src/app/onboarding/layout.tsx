import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { syncBusinessTrialLock } from "@/lib/business-subscription";
import { isTrialEnforcedAndExpired } from "@/lib/trial-enforcement";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.business) {
    await syncBusinessTrialLock(user.business);
    if (await isTrialEnforcedAndExpired(user.business)) {
      redirect("/trial-expired");
    }
    redirect("/dashboard");
  }

  return children;
}
