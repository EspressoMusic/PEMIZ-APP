import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import {
  SignupClosedPanel,
  SignupFormFooter,
} from "@/components/auth-form-footer";
import { getCurrentUser } from "@/lib/auth";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user?.business) redirect("/dashboard");
  if (user) redirect("/onboarding");

  const signupsEnabled = await isSignupEnabled();

  if (!signupsEnabled) {
    return <SignupClosedPanel />;
  }

  return <AuthForm mode="signup" footer={<SignupFormFooter />} />;
}
