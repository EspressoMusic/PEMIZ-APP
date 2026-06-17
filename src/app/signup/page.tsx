import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function SignupPage() {
  const signupsEnabled = await isSignupEnabled();

  if (!signupsEnabled) {
    return (
      <WebShell maxWidth="max-w-md" lockViewport>
        <div className="mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Panel>
            <PageTitle subtitle="The platform is open to existing users only">
              Sign-up is closed
            </PageTitle>
            <Alert variant="info">
              New stores cannot be opened right now. If you already have an account, sign in.
            </Alert>
            <Link href="/login" className="mt-6 block text-center">
              <span className="text-[15px] font-bold text-bakery-primary hover:underline">
                Go to sign in
              </span>
            </Link>
          </Panel>
        </div>
      </WebShell>
    );
  }

  return (
    <AuthForm
      mode="signup"
      footer={
        <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    />
  );
}
