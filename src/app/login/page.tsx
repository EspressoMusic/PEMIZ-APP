import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { LoginFormFooter } from "@/components/auth-form-footer";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" footer={<LoginFormFooter />} />
    </Suspense>
  );
}
