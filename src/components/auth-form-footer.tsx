"use client";

import Link from "next/link";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

export function SignupClosedPanel() {
  const { copy } = useMarketingLocale();

  return (
    <WebShell maxWidth="max-w-md" lockViewport>
      <div className="mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Panel>
          <PageTitle subtitle={copy.authSignUpClosedSub}>
            {copy.authSignUpClosedTitle}
          </PageTitle>
          <Alert variant="info">{copy.authSignUpClosedAlert}</Alert>
          <Link href="/login" className="mt-6 block text-center">
            <span className="text-[15px] font-bold text-bakery-primary hover:underline">
              {copy.authGoToSignIn}
            </span>
          </Link>
        </Panel>
      </div>
    </WebShell>
  );
}

export function LoginFormFooter() {
  const { copy } = useMarketingLocale();

  return (
    <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
      {copy.authNoAccount}{" "}
      <Link
        href="/signup"
        className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
      >
        {copy.authSubmitSignUp}
      </Link>
    </p>
  );
}

export function SignupFormFooter() {
  const { copy } = useMarketingLocale();

  return (
    <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
      {copy.authAlreadyRegistered}{" "}
      <Link
        href="/login"
        className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
      >
        {copy.authSubmitSignIn}
      </Link>
    </p>
  );
}
