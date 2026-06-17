import type { ReactNode } from "react";

/** Public landing page shell */
export function HomeLandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="home-landing-bg flex min-h-dvh flex-col" lang="en" dir="ltr">
      {children}
    </div>
  );
}
