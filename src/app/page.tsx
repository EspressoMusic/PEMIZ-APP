import Link from "next/link";
import { WebShell } from "@/components/web-shell";
import { Button, Alert } from "@/components/ui";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function HomePage() {
  const signupsEnabled = await isSignupEnabled();

  return (
    <WebShell>
      <section className="flex min-h-[min(70dvh,560px)] flex-col items-center justify-center px-4 py-12 sm:min-h-[50vh] sm:py-16">
        {!signupsEnabled && (
          <div className="mb-6 w-full max-w-md">
            <Alert variant="info">ההרשמה לחנויות חדשות סגורה כרגע.</Alert>
          </div>
        )}
        <div className="flex w-full max-w-md flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 md:gap-6">
          {signupsEnabled ? (
            <Link href="/signup">
              <Button className="bakery-cta-3d bakery-cta-3d--primary !rounded-full !shadow-none hover:!opacity-100">
                היכנס לחנות
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="bakery-cta-3d bakery-cta-3d--primary !rounded-full !opacity-50"
            >
              היכנס לחנות
            </Button>
          )}
          <Link href="/login">
            <Button
              variant="secondary"
              className="bakery-cta-3d bakery-cta-3d--secondary !rounded-full !border-2 !shadow-none hover:!bg-transparent"
            >
              התחברות לחנות
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t-[1.2px] border-bakery-border/40 py-8 text-center text-[14px] text-bakery-muted">
        <Link href="/privacy" className="font-medium hover:text-bakery-ink">
          מדיניות פרטיות
        </Link>
        {" · "}
        <Link href="/terms" className="font-medium hover:text-bakery-ink">
          תנאי שימוש
        </Link>
      </footer>
    </WebShell>
  );
}
