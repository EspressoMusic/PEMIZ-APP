import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function SignupPage() {
  const signupsEnabled = await isSignupEnabled();

  if (!signupsEnabled) {
    return (
      <WebShell>
        <div className="mx-auto w-full max-w-md px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
          <Panel>
            <PageTitle subtitle="המערכת פתוחה רק למשתמשים קיימים">
              ההרשמה סגורה
            </PageTitle>
            <Alert variant="info">
              לא ניתן לפתוח חנות חדשה כרגע. אם יש לך כבר חשבון — התחבר/י.
            </Alert>
            <Link href="/login" className="mt-6 block text-center">
              <span className="text-[15px] font-bold text-bakery-primary hover:underline">
                מעבר להתחברות
              </span>
            </Link>
          </Panel>
        </div>
      </WebShell>
    );
  }

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
