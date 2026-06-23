import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { LoginFormFooter } from "@/components/auth-form-footer";
import { getCurrentUser } from "@/lib/auth";
import { APP_SIGNUP_PATH } from "@/lib/app-auth-paths";

export default async function AppLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <Suspense fallback={null}>
      <AuthForm
        mode="login"
        footer={<LoginFormFooter signupHref={APP_SIGNUP_PATH} />}
      />
    </Suspense>
  );
}
