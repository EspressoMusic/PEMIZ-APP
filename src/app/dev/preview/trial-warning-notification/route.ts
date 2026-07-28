import { trialWarningCopy, type TrialWarningDaysLeft } from "@/lib/email";
import { pushCopy } from "@/lib/trial-warnings";
import { renderNotificationPreviewPage } from "@/lib/dev-notification-preview";

export function GET(req: Request) {
  const url = new URL(req.url);
  const daysParam = Number(url.searchParams.get("days") ?? "3");
  const daysLeft: TrialWarningDaysLeft =
    daysParam === 7 || daysParam === 1 ? daysParam : 3;

  const storeName = "חנות לדוגמה";
  const trialEndsAt = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);

  const { subject, html } = trialWarningCopy(daysLeft, storeName, trialEndsAt);
  const push = pushCopy(daysLeft, storeName);

  const page = renderNotificationPreviewPage({
    pageTitle: `תזכורת לקראת סיום ניסיון (${daysLeft} ימים) — תצוגה מקדימה`,
    emailSubject: subject,
    emailHtml: html,
    pushTitle: push.title,
    pushBody: push.body,
  });

  return new Response(page, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
