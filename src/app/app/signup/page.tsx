import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import {
  SignupClosedPanel,
  SignupFormFooter,
} from "@/components/auth-form-footer";
import { getCurrentUser } from "@/lib/auth";
import { isSignupEnabled } from "@/lib/platform-config";
import { APP_LOGIN_PATH } from "@/lib/app-auth-paths";

export default async function AppSignupPage() {
  const user = await getCurrentUser();
  if (user?.business) redirect("/dashboard");
  if (user) redirect("/onboarding");

  const signupsEnabled = await isSignupEnabled();

  if (!signupsEnabled) {
    return <SignupClosedPanel loginHref={APP_LOGIN_PATH} />;
  }

  return (
    <Suspense fallback={null}>
      <AuthForm
        mode="signup"
        footer={<SignupFormFooter loginHref={APP_LOGIN_PATH} />}
      />
    </Suspense>
  );
}
