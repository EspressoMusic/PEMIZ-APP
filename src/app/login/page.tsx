import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
    <AuthForm
      mode="login"
      footer={
        <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
          No account?{" "}
          <Link
            href="/signup"
            className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    />
    </Suspense>
  );
}
