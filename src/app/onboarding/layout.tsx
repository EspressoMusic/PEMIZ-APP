import { AppLocaleShell } from "@/components/app-locale-shell";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLocaleShell>{children}</AppLocaleShell>;
}
