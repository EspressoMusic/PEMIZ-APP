import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";
import { SellerNotifyPrompt } from "@/components/dashboard/seller-notify-prompt";

export default function DevSellerNotifyPromptPreviewPage() {
  return (
    <AppLocaleProvider initialLocale="he">
      <div className="bakery-frame-bg flex min-h-dvh items-center justify-center p-6">
        <p className="text-center text-[13px] font-bold text-bakery-muted">
          תצוגה מקדימה — החלון שמוצג למוכר חדש בפעם הראשונה, שואל אם להפעיל
          התראות.
        </p>
        <SellerNotifyPrompt
          businessId="dev-preview-notify-prompt"
          waitForGuide={false}
        />
      </div>
    </AppLocaleProvider>
  );
}
