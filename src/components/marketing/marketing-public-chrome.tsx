"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refund" },
  { href: "/accessibility", label: "Accessibility" },
] as const;

export function MarketingPublicHeader() {
  const pathname = usePathname();

  return (
    <header className="navbar scrolled">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <Image
              src="/marketing/logo-transparent.png"
              alt="Peymiz"
              width={40}
              height={40}
              className="logo-img"
            />
          </span>
          <span className="logo-text">
            Pey<span>miz</span>
          </span>
        </Link>

        <nav className="nav-links public-nav-links" aria-label="Site">
          {PUBLIC_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function MarketingPublicFooter() {
  const pathname = usePathname();

  return (
    <footer>
      <div className="container footer-simple">
        <Link href="/" className="logo logo-foot">
          <span className="logo-mark">
            <Image
              src="/marketing/logo-transparent.png"
              alt="Peymiz"
              width={36}
              height={36}
              className="logo-img"
            />
          </span>
          <span className="logo-text">
            Pey<span>miz</span>
          </span>
        </Link>
        <nav className="footer-nav" aria-label="Legal and site">
          {PUBLIC_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="footer-copy">© 2026 Peymiz. B2B software for small businesses.</p>
      </div>
    </footer>
  );
}
