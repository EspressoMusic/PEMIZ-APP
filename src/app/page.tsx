import Link from "next/link";
import { HomeLandingShell } from "@/components/home-landing-shell";
import { HomeLandingHero } from "@/components/home-landing-hero";
import { HomeLandingInstall } from "@/components/home-landing-install";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function HomePage() {
  const signupsEnabled = await isSignupEnabled();

  return (
    <HomeLandingShell>
      <HomeLandingHero signupsEnabled={signupsEnabled} />
      <HomeLandingInstall />

      <footer className="relative z-10 shrink-0 border-t border-bakery-border/25 bg-bakery-scaffold/30 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[14px] text-bakery-muted backdrop-blur-[3px] sm:py-8">
        <Link href="/privacy" className="font-medium hover:text-bakery-ink">
          מדיניות פרטיות
        </Link>
        {" · "}
        <Link href="/terms" className="font-medium hover:text-bakery-ink">
          תנאי שימוש
        </Link>
      </footer>
    </HomeLandingShell>
  );
}
