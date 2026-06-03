import Link from "next/link";

export function CustomerSiteFooter() {
  return (
    <footer className="mt-auto border-t border-bakery-border/25 bg-customer-nav/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-[13px] text-bakery-muted xl:px-10">
        <p>Powered by Linky</p>
        <div className="flex gap-4 font-semibold">
          <Link href="/privacy" className="hover:text-bakery-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-bakery-ink">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
