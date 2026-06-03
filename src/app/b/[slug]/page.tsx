import { notFound } from "next/navigation";
import {
  getBusinessBySlug,
  isBusinessAcceptingCustomers,
  publicBusinessUrl,
} from "@/lib/business";
import { PublicStorefront } from "@/components/public-storefront";

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const unavailable = !isBusinessAcceptingCustomers(business);

  return (
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
        })),
        deals: business.storeDeals.map((d) => ({
          id: d.id,
          name: d.name,
          dealPrice: d.dealPrice,
          validUntil: d.validUntil.toISOString(),
          productA: {
            id: d.productA.id,
            name: d.productA.name,
            imageUrl: d.productA.imageUrl,
            price: d.productA.price,
            salePrice: d.productA.salePrice,
          },
          productB: {
            id: d.productB.id,
            name: d.productB.name,
            imageUrl: d.productB.imageUrl,
            price: d.productB.price,
            salePrice: d.productB.salePrice,
          },
        })),
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
      }}
      unavailable={unavailable}
    />
  );
}
