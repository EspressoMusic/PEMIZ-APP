"use client";

import Link from "next/link";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

export function SignupClosedPanel({ loginHref = "/login" }: { loginHref?: string }) {
  const { copy } = useMarketingLocale();

  return (
    <WebShell maxWidth="max-w-md" lockViewport>
      <div className="mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Panel>
          <PageTitle subtitle={copy.authSignUpClosedSub}>
            {copy.authSignUpClosedTitle}
          </PageTitle>
          <Alert variant="info">{copy.authSignUpClosedAlert}</Alert>
          <Link href={loginHref} className="mt-6 block text-center">
            <span className="text-[15px] font-bold text-bakery-primary hover:underline">
              {copy.authGoToSignIn}
            </span>
          </Link>
        </Panel>
      </div>
    </WebShell>
  );
}

export function LoginFormFooter({ signupHref = "/signup" }: { signupHref?: string }) {
  const { copy } = useMarketingLocale();

  return (
    <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
      {copy.authNoAccount}{" "}
      <Link
        href={signupHref}
        className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
      >
        {copy.authSubmitSignUp}
      </Link>
    </p>
  );
}

export function SignupFormFooter({ loginHref = "/login" }: { loginHref?: string }) {
  const { copy } = useMarketingLocale();

  return (
    <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
      {copy.authAlreadyRegistered}{" "}
      <Link
        href={loginHref}
        className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
      >
        {copy.authSubmitSignIn}
      </Link>
    </p>
  );
}
