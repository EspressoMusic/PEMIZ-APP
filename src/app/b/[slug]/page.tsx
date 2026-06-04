import { notFound } from "next/navigation";
import {
  getBusinessBySlug,
  isBusinessAcceptingCustomers,
  publicBusinessUrl,
} from "@/lib/business";
import { getDealProducts } from "@/lib/store-deal";
import { PublicStorefront } from "@/components/public-storefront";
import { getAllPlatformLegalDocuments } from "@/lib/legal/platform-legal";

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const unavailable = !isBusinessAcceptingCustomers(business);
  const platformLegalDocs = getAllPlatformLegalDocuments();

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4">
    <PublicStorefront
      business={{
        slug: business.slug,
        name: business.name,
        description: business.description,
        type: business.type,
        products: business.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          price: p.price,
          salePrice: p.salePrice,
          stock: p.stock,
        })),
        deals: business.storeDeals.map((d) => {
          const prods = getDealProducts(d);
          return {
            id: d.id,
            name: d.name,
            dealPrice: d.dealPrice,
            validUntil: d.validUntil.toISOString(),
            products: prods.map((p) => ({
              id: p.id,
              name: p.name,
              imageUrl: p.imageUrl,
              price: p.price,
              salePrice: p.salePrice,
              stock: p.stock,
            })),
          };
        }),
        slots: business.slots.map((s) => ({
          id: s.id,
          startAt: s.startAt.toISOString(),
          endAt: s.endAt.toISOString(),
          maxBookings: s.maxBookings,
          appointments: s.appointments,
        })),
        faqItems: business.faqItems.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        })),
        storeUrl: publicBusinessUrl(business.slug),
        storeTheme: business.storeTheme,
        storeLocale: business.storeLocale,
        storePolicy: business.storePolicy,
        storeTerms: business.storeTerms,
        storeBroadcast: business.storeBroadcast,
        storeBroadcastAt: business.storeBroadcastAt?.toISOString() ?? null,
      }}
      unavailable={unavailable}
      platformLegalDocs={platformLegalDocs}
    />
      </div>
    </div>
  );
}
