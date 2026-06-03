import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <AuthForm mode="login" />
      <p className="-mt-4 pb-10 text-center text-[14px] text-bakery-muted">
        אין חשבון?{" "}
        <Link href="/signup" className="font-bold text-bakery-ink underline-offset-2 hover:underline">
          הרשמה
        </Link>
      </p>
    </>
  );
}
