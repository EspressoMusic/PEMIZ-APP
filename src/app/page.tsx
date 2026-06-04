import Link from "next/link";
import { HomeBizilinkBrand } from "@/components/home-bizilink-brand";
import { HomeLandingShell } from "@/components/home-landing-shell";
import { Button, Alert } from "@/components/ui";
import { homeTitleFont } from "@/lib/fonts/home-title-font";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function HomePage() {
  const signupsEnabled = await isSignupEnabled();

  return (
    <HomeLandingShell>
        <section className="app-safe-x flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
          <h1
            className={`${homeTitleFont.className} home-landing-title mb-8 max-w-md text-center text-[28px] leading-[1.15] text-bakery-ink sm:mb-10 sm:text-[34px]`}
          >
            ברוכים הבאים ל: <HomeBizilinkBrand />
          </h1>
          {!signupsEnabled && (
            <div className="mb-5 w-full max-w-[22rem]">
              <Alert variant="info">ההרשמה לחנויות חדשות סגורה כרגע.</Alert>
            </div>
          )}
          <div className="mx-auto flex w-full max-w-[min(100%,22rem)] flex-col items-stretch gap-4">
            {signupsEnabled ? (
              <Link href="/signup" className="block w-full">
                <Button className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !shadow-none hover:!opacity-100">
                  פתיחת חנות
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !opacity-50"
              >
                פתיחת חנות
              </Button>
            )}
            <Link href="/login" className="block w-full">
              <Button
                variant="secondary"
                className="bakery-cta-3d bakery-cta-3d--secondary bakery-cta-3d--home !w-full !rounded-full !border-2 !shadow-none hover:!bg-transparent"
              >
                התחברות
              </Button>
            </Link>
          </div>
        </section>

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
