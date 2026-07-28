import { trialEndedCopy } from "@/lib/email";
import { trialEndedPushCopy } from "@/lib/trial-warnings";
import { renderNotificationPreviewPage } from "@/lib/dev-notification-preview";

export function GET() {
  const storeName = "חנות לדוגמה";

  const { subject, html } = trialEndedCopy(storeName);
  const push = trialEndedPushCopy(storeName);

  const page = renderNotificationPreviewPage({
    pageTitle: "התראת סיום ניסיון — תצוגה מקדימה",
    emailSubject: subject,
    emailHtml: html,
    pushTitle: push.title,
    pushBody: push.body,
  });

  return new Response(page, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
