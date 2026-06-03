"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function DashboardBackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-[14px] font-bold text-bakery-primary"
    >
      <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      {children}
    </Link>
  );
}

export function DashboardActionsBackLink({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();
  return (
    <DashboardBackLink href={`${basePath}/actions`}>
      {labels.backToActions}
    </DashboardBackLink>
  );
}

export function DashboardSettingsBackLink({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();
  return (
    <DashboardBackLink href={`${basePath}/settings`}>
      {labels.backToStore}
    </DashboardBackLink>
  );
}

export function DashboardCustomersBackLink({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();
  return (
    <DashboardBackLink href={`${basePath}/customers`}>
      {labels.backToCustomers}
    </DashboardBackLink>
  );
}
