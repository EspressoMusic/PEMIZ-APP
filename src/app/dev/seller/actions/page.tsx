import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default async function DevSellerActionsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale: localeParam } = await searchParams;
  // Dev-only override — e.g. ?locale=en — to preview this page in a
  // language other than the fixture's default.
  const storeLocale =
    localeParam === "en" || localeParam === "he"
      ? localeParam
      : DEV_STORE_BUSINESS.storeLocale;

  return (
    <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={storeLocale}>
      <DashboardActionsHub
        businessType="STORE"
        basePath="/dev/seller"
        previewOnly
      />
    </DashboardShell>
  );
}
