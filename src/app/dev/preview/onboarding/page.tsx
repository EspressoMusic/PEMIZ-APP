import { AppLocaleShell } from "@/components/app-locale-shell";
import OnboardingPage from "@/app/onboarding/page";

export default function DevOnboardingPreviewPage() {
  return (
    <AppLocaleShell>
      <div className="flex h-dvh min-h-0 flex-1 flex-col overflow-hidden">
        <OnboardingPage />
      </div>
    </AppLocaleShell>
  );
}
