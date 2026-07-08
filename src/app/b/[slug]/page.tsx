import { Suspense } from "react";
import type { Metadata } from "next";
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
import { prisma } from "@/lib/prisma";
import { isDemoStoreSlug } from "@/lib/demo-store-slugs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const business = await prisma.business.findUnique({
    where: { slug: normalizedSlug },
    select: { name: true, description: true, isActive: true, storeAddress: true },
  });

  if (!business) {
    return { title: "Store not found — Peymiz" };
  }

  const title = `${business.name} — Peymiz`;
  const description =
    business.description?.trim() ||
    (business.storeAddress
      ? `${business.name} — ${business.storeAddress}`
      : `${business.name} — powered by Peymiz`);
  const shouldIndex = business.isActive && !isDemoStoreSlug(normalizedSlug);
  const path = `/b/${normalizedSlug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: shouldIndex, follow: true },
    openGraph: { type: "website", url: path, title, description },
    twitter: { card: "summary", title, description },
  };
}

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

  const reviewAggregate = !unavailable
    ? await prisma.storeReview.aggregate({
        where: { businessId: business.id },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : null;

  const localBusinessJsonLd = !unavailable
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: business.name,
        url: publicBusinessUrl(business.slug),
        ...(business.description ? { description: business.description } : {}),
        ...(business.storeAddress
          ? { address: { "@type": "PostalAddress", streetAddress: business.storeAddress } }
          : {}),
        ...(reviewAggregate && reviewAggregate._count.rating > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number((reviewAggregate._avg.rating ?? 0).toFixed(1)),
                reviewCount: reviewAggregate._count.rating,
              },
            }
          : {}),
      }
    : null;

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      {localBusinessJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
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
