import type { Metadata } from "next";
import { HomeLandingShell } from "@/components/home-landing-shell";
import { HomeLandingHero } from "@/components/home-landing-hero";
import { HomeLandingFooter } from "@/components/home-landing-footer";

const TITLE = "Sign Up or Sign In — Peymiz";
const DESCRIPTION =
  "Open your business page on Peymiz or sign in to manage your existing store — orders, appointments, and customers in one simple dashboard.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/seller" },
  openGraph: {
    type: "website",
    url: "/seller",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function SellerGatewayPage() {
  return (
    <HomeLandingShell>
      <HomeLandingHero />
      <HomeLandingFooter />
    </HomeLandingShell>
  );
}
