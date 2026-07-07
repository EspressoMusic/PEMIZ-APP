import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getBusinessBySlug,
  isBusinessAcceptingCustomers,
  publicBusinessUrl,
} from "@/lib/business";
import { serializePublicStoreDeal } from "@/lib/public-deals";
import { PublicStorefront } from "@/components/public-storefront";
import { getAllPlatformLegalDocuments } from "@/lib/legal/platform-legal";
import { serializeProductImages } from "@/lib/product-api-images";
import { ServiceUnavailableNotice } from "@/components/service-unavailable-notice";
import { recordSystemIncident } from "@/lib/system-incidents";
import { formatServerError } from "@/lib/server-errors";
import { storePanelsFromBusiness } from "@/lib/store-panels-visible";

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let business;
  try {
    business = await getBusinessBySlug(slug);
  } catch (error) {
    const detail = formatServerError(error);
    recordSystemIncident({
      context: `storefront:${slug}`,
      publicMessage: detail.publicMessage,
      developerMessage: detail.developerMessage,
      error,
    });
    return (
      <div className="bakery-frame-bg h-dvh overflow-hidden">
        <ServiceUnavailableNotice />
      </div>
    );
  }
  if (!business) notFound();

  const unavailable = !isBusinessAcceptingCustomers(business);
  const platformLegalDocs = getAllPlatformLegalDocuments();

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4">
        <Suspense fallback={null}>
          <PublicStorefront
            business={{
        slug: business.slug,
        name: business.name,
        description: business.description,
        type: business.type,
        products: business.products.map((p) => {
          const serialized = serializeProductImages(p);
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            imageUrl: serialized.imageUrl,
            imageUrls: serialized.imageUrls,
            price: p.price,
            salePrice: p.salePrice,
            stock: p.stock,
          };
        }),
        deals: business.storeDeals.map((d) => serializePublicStoreDeal(d)),
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
        storeOpeningHours: business.storeOpeningHours,
        storeAddress: business.storeAddress,
        orderScheduleEnabled: business.orderScheduleEnabled ?? false,
        orderSchedule: business.orderSchedule ?? null,
        appointmentBookingByDay: business.appointmentBookingByDay ?? false,
        storeBroadcast: business.storeBroadcast,
        storeBroadcastAt: business.storeBroadcastAt?.toISOString() ?? null,
        storePanelsVisible: storePanelsFromBusiness(business),
        sellerContactPhone: business.owner?.phone ?? null,
      }}
            unavailable={unavailable}
            platformLegalDocs={platformLegalDocs}
          />
        </Suspense>
      </div>
    </div>
  );
}
