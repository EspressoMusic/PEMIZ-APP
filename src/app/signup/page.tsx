import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <>
      <AuthForm mode="signup" />
      <p className="-mt-4 pb-10 text-center text-[14px] text-bakery-muted">
        כבר רשום?{" "}
        <Link href="/login" className="font-bold text-bakery-ink underline-offset-2 hover:underline">
          התחברות
        </Link>
      </p>
    </>
  );
}
