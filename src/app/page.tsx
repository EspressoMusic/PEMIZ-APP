import Link from "next/link";
import { WebShell } from "@/components/web-shell";
import { Button, Alert } from "@/components/ui";
import { isSignupEnabled } from "@/lib/platform-config";

export default async function HomePage() {
  const signupsEnabled = await isSignupEnabled();

  return (
    <WebShell>
      <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 md:px-[14px]">
        {!signupsEnabled && (
          <div className="mb-6 w-full max-w-md">
            <Alert variant="info">ההרשמה לחנויות חדשות סגורה כרגע.</Alert>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6">
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
