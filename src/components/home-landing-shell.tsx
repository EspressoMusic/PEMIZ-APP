import type { ReactNode } from "react";

/** Minimal ornamental background for the public landing page */
export function HomeLandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="home-landing-bg flex min-h-dvh flex-col">
      <div className="home-landing-ornaments" aria-hidden>
        <span className="home-landing-glow home-landing-glow--tl" />
        <span className="home-landing-glow home-landing-glow--br" />
        <span className="home-landing-ring home-landing-ring--a" />
        <span className="home-landing-ring home-landing-ring--b" />
        <span className="home-landing-arc" />
        <span className="home-landing-dot home-landing-dot--1" />
        <span className="home-landing-dot home-landing-dot--2" />
        <span className="home-landing-dot home-landing-dot--3" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
