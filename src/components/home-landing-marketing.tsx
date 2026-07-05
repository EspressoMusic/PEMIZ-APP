import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import {
  CalendarDays,
  Link2,
  MessageSquare,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { HomeBizilinkBrand } from "@/components/home-bizilink-brand";
import { homeTitleFont } from "@/lib/fonts/home-title-font";

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Online store",
    text: "Products, deals, and a cart your customers can use from any phone.",
  },
  {
    icon: CalendarDays,
    title: "Appointments & rentals",
    text: "Book services or rental slots with a calendar that fits your hours.",
  },
  {
    icon: Package,
    title: "Orders in one place",
    text: "See new orders, stock alerts, and history from a simple dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Customer contact",
    text: "FAQ, WhatsApp, and inquiry forms — all from your store page.",
  },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Open your store",
    text: "Sign up, pick a name, and choose products or appointments.",
  },
  {
    step: "2",
    title: "Share one link",
    text: "Send your BiziLink to customers on Instagram, WhatsApp, or anywhere.",
  },
  {
    step: "3",
    title: "Run it from your phone",
    text: "Manage orders, messages, and settings from the seller dashboard.",
  },
] as const;

export function HomeLandingMarketing() {
  return (
    <div className="home-landing-marketing pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <section className="app-safe-x px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] text-center sm:pb-14 sm:pt-10">
        <div className="mx-auto flex max-w-lg flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-[22%] sm:h-32 sm:w-32">
            <AppLogo
              size={160}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <h1
            className={`${homeTitleFont.className} home-landing-title mt-5 text-[32px] leading-[1.12] text-bakery-ink sm:text-[38px]`}
          >
            <HomeBizilinkBrand />
          </h1>
          <p className="mt-3 max-w-md text-[18px] font-semibold leading-snug text-bakery-ink sm:text-[20px]">
            Your business, one link away
          </p>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bakery-muted sm:text-[16px]">
            A simple storefront and seller dashboard for small businesses — orders,
            appointments, and customer messages without the hassle.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-bakery-border/40 bg-bakery-card/80 px-4 py-2 text-[13px] font-bold text-bakery-ink">
            <Sparkles className="h-4 w-4 text-bakery-primary" strokeWidth={2} />
            14-day free trial · No card required to start
          </p>
        </div>
      </section>

      <section className="app-safe-x px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-[22px] font-extrabold text-bakery-ink sm:text-[24px]">
            Everything in one place
          </h2>
          <ul className="mt-5 space-y-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex gap-3 rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 shadow-[0_3px_10px_rgba(58,47,38,0.08)]"
              >
                <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                  <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 text-start">
                  <span className="block text-[16px] font-extrabold text-bakery-ink">
                    {title}
                  </span>
                  <span className="mt-1 block text-[14px] leading-snug text-bakery-muted">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="app-safe-x px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-[22px] font-extrabold text-bakery-ink sm:text-[24px]">
            How it works
          </h2>
          <ol className="mt-5 space-y-3">
            {STEPS.map(({ step, title, text }) => (
              <li
                key={step}
                className="flex gap-3 rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-card/95 p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bakery-primary text-[17px] font-extrabold text-bakery-on-primary">
                  {step}
                </span>
                <span className="min-w-0 text-start">
                  <span className="block text-[16px] font-extrabold text-bakery-ink">
                    {title}
                  </span>
                  <span className="mt-1 block text-[14px] leading-snug text-bakery-muted">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="app-safe-x px-4 pb-4 pt-2">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-[22px] border border-bakery-border/30 bg-bakery-square/80 px-5 py-6 text-center">
          <Link2 className="h-8 w-8 text-bakery-primary" strokeWidth={1.75} />
          <p className="mt-3 text-[17px] font-extrabold text-bakery-ink">
            Ready to open your store?
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-bakery-muted">
            See{" "}
            <Link href="/pricing" className="font-bold text-bakery-primary hover:underline">
              pricing
            </Link>{" "}
            or tap <span className="font-bold text-bakery-ink">Store</span> below to
            sign up or sign in.
          </p>
          <div className="mt-4 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/pricing"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border-2 border-bakery-primary bg-transparent px-5 text-[15px] font-extrabold text-bakery-ink transition active:scale-[0.98]"
            >
              View pricing
            </Link>
            <Link
              href="/seller"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-bakery-primary px-5 text-[15px] font-extrabold text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition active:scale-[0.98]"
            >
              Open store
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
