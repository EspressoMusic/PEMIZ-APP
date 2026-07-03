import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { isGuestLoginAllowed } from "@/lib/auth-guest-dev";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user?.business) redirect("/dashboard");
  if (user) redirect("/onboarding");

  return (
    <Suspense fallback={null}>
      <AuthForm allowGuest={isGuestLoginAllowed()} />
    </Suspense>
  );
}
