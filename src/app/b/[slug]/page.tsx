import { notFound } from "next/navigation";
import { getBusinessBySlug, isBusinessAcceptingCustomers } from "@/lib/business";
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
        products: business.products,
        slots: business.slots.map((s) => ({
          id: s.id,
          startAt: s.startAt.toISOString(),
          endAt: s.endAt.toISOString(),
          maxBookings: s.maxBookings,
          appointments: s.appointments,
        })),
      }}
      unavailable={unavailable}
    />
  );
}
