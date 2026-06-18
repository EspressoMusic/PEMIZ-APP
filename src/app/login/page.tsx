import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { LoginFormFooter } from "@/components/auth-form-footer";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" footer={<LoginFormFooter />} />
    </Suspense>
  );
}
