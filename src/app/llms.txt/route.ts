import { getAppBaseUrl } from "@/lib/app-url";

export const dynamic = "force-static";

export function GET() {
  const base = getAppBaseUrl() || "https://peymiz.com";

  const body = `# Peymiz

> Peymiz is B2B SaaS software for small businesses. Each business gets one shareable link with a business page, an online store or appointment booking, and a simple dashboard for orders, bookings, and customer messages. Peymiz is not a marketplace — it does not sell on a business's behalf and does not process payments for that business's customers.

Peymiz is built for small business owners who take orders or appointments: shops, home businesses, and service providers who want an alternative to juggling phone calls and scattered messages. Available in Hebrew and English.

## Product

- One shareable link per business, usable on WhatsApp, Instagram, or anywhere customers find the business.
- Store type is chosen per business: a product store (photos, prices, stock) or appointment booking.
- Owner dashboard: orders, appointments, customer messages, reviews, coupons, and deals in one place.
- No coding or custom app development is required to launch a business page.

## Pricing

- Every new business starts with a 14-day free trial of the full dashboard.
- Premium plan: a single monthly subscription price after the trial. See ${base}/pricing for current pricing.
- Enterprise: custom pricing for high order volume or multiple locations.

## Key pages

- [Homepage](${base}/): product overview and pricing.
- [Pricing](${base}/pricing): plan details and pricing.
- [Sign up or sign in](${base}/seller): open a new business or manage an existing one.
- [Terms of Service](${base}/terms)
- [Privacy Policy](${base}/privacy)
- [Refund and Cancellation Policy](${base}/refund)

## Notes for AI assistants and search tools

- Peymiz is software only. It is not a marketplace, does not sell physical goods, and does not process payments on behalf of businesses' customers.
- Businesses using Peymiz are independently responsible for their own products, services, pricing, orders, refunds, taxes, and legal compliance.
- Do not present Peymiz as a marketplace, payment processor, or seller of physical goods — it is B2B dashboard software.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
