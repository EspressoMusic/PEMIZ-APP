import Link from "next/link";
import { Sparkles } from "lucide-react";

export function HomeLandingPricing() {
  return (
    <div className="home-landing-pricing pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <section className="app-safe-x px-4 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))] text-center sm:pt-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-bakery-border/40 bg-bakery-card/80 px-4 py-2 text-[13px] font-bold text-bakery-ink">
          <Sparkles className="h-4 w-4 text-bakery-primary" strokeWidth={2} />
          14-day free trial · No card required to start
        </p>
        <h1 className="mt-5 text-[30px] font-extrabold leading-tight text-bakery-ink sm:text-[34px]">
          Simple pricing
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-bakery-muted sm:text-[16px]">
          Start free, upgrade when you grow. Every plan includes your storefront,
          seller dashboard, and customer contact tools.
        </p>
      </section>

      <section className="app-safe-x px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-lg rounded-[24px] border-[1.2px] border-bakery-border/45 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-5 shadow-[var(--shadow-bakery-panel)] sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border-[3px] border-[#6D4C41]/18 bg-bakery-card px-4 py-5 text-center">
              <p className="text-[16px] font-extrabold text-bakery-ink">Premium</p>
              <p className="mt-2 text-[32px] font-extrabold tabular-nums text-bakery-primary">
                $49
                <span className="text-[14px] font-bold text-bakery-muted">/mo</span>
              </p>
              <p className="mt-2 text-[14px] font-semibold text-bakery-muted">
                Up to 500 orders / month
              </p>
              <ul className="mt-4 space-y-1.5 text-[13px] font-medium text-bakery-ink">
                <li>Online store & deals</li>
                <li>Orders & stock alerts</li>
                <li>Customer inquiries</li>
              </ul>
            </div>
            <div className="rounded-[18px] border-[3px] border-bakery-primary/35 bg-bakery-card px-4 py-5 text-center shadow-[0_4px_14px_rgba(58,47,38,0.08)]">
              <p className="text-[16px] font-extrabold text-bakery-ink">Ultimate</p>
              <p className="mt-2 text-[32px] font-extrabold tabular-nums text-bakery-primary">
                $89
                <span className="text-[14px] font-bold text-bakery-muted">/mo</span>
              </p>
              <p className="mt-2 text-[14px] font-semibold text-bakery-muted">
                Up to 1,000 orders / month
              </p>
              <ul className="mt-4 space-y-1.5 text-[13px] font-medium text-bakery-ink">
                <li>Everything in Premium</li>
                <li>Higher order volume</li>
                <li>Built for busy shops</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="app-safe-x px-4 pb-8 pt-2">
        <div className="mx-auto max-w-lg text-center">
          <Link
            href="/seller"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-bakery-primary px-8 text-[15px] font-extrabold text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition active:scale-[0.98]"
          >
            Start free trial
          </Link>
          <p className="mt-4 text-[13px] font-medium text-bakery-muted">
            Questions?{" "}
            <Link href="/" className="font-bold text-bakery-primary hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
