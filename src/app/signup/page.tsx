import { AuthForm } from "@/components/auth-form";
import {
  SignupClosedPanel,
  SignupFormFooter,
} from "@/components/auth-form-footer";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function SignupPage() {
  const signupsEnabled = await isSignupEnabled();

  if (!signupsEnabled) {
    return <SignupClosedPanel />;
  }

  return <AuthForm mode="signup" footer={<SignupFormFooter />} />;
}
