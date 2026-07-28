import { prisma } from "@/lib/prisma";
import { getBusinessTrialStatus } from "@/lib/business-trial";
import { isBusinessTrialBypassed } from "@/lib/trial-dev";
import {
  areTrialWarningEmailsEnabled,
  isTrialClosureEnabled,
} from "@/lib/trial-enforcement";
import {
  sendTrialEndingWarningEmail,
  sendTrialEndedEmail,
  type TrialWarningDaysLeft,
} from "@/lib/email";
import { dispatchOwnerPush } from "@/lib/seller-push";

type WarningStage = {
  daysLeft: TrialWarningDaysLeft;
  field: "trialWarned7dAt" | "trialWarned3dAt" | "trialWarned1dAt";
  shouldSend: (daysRemaining: number, expired: boolean) => boolean;
};

const WARNING_STAGES: WarningStage[] = [
  {
    daysLeft: 7,
    field: "trialWarned7dAt",
    shouldSend: (daysRemaining) => daysRemaining <= 7 && daysRemaining > 3,
  },
  {
    daysLeft: 3,
    field: "trialWarned3dAt",
    shouldSend: (daysRemaining) => daysRemaining <= 3 && daysRemaining > 1,
  },
  {
    daysLeft: 1,
    field: "trialWarned1dAt",
    shouldSend: (daysRemaining, expired) => daysRemaining <= 1 && !expired,
  },
];

export function pushCopy(daysLeft: TrialWarningDaysLeft, storeName: string) {
  const when =
    daysLeft === 7 ? "בעוד שבוע" : daysLeft === 3 ? "בעוד 3 ימים" : "מחר";
  return {
    title:
      daysLeft === 1
        ? "מחר מסתיימת תקופת הניסיון"
        : "תקופת הניסיון מסתיימת בקרוב",
    body: `${storeName} — ${when}`,
    url: "/dashboard",
    tag: `trial-warning-${daysLeft}d`,
  };
}

export function trialEndedPushCopy(storeName: string) {
  return {
    title: "תקופת הניסיון הסתיימה",
    body: `${storeName} — בחרו מנוי או סגרו את החנות`,
    url: "/dashboard",
    tag: "trial-ended",
  };
}

/** In-app popup text — shown via the same "message from the Linky team" banner/modal an admin uses. */
export function trialWarningPopupMessage(
  daysLeft: TrialWarningDaysLeft,
  trialEndsAt: Date
): string {
  const endsLabel = trialEndsAt.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const when =
    daysLeft === 7 ? "בעוד שבוע" : daysLeft === 3 ? "בעוד 3 ימים" : "מחר";
  return `תקופת הניסיון החינמית של החנות שלכם מסתיימת ${when} (${endsLabel}). כדי להמשיך להשתמש בדשבורד בלי הפרעה, אפשר לבחור מנוי חודשי מתוך הגדרות ← מנוי.`;
}

export function trialEndedPopupMessage(): string {
  return "תקופת הניסיון החינמית של החנות שלכם הסתיימה. כדי להשאיר את החנות פעילה יש לבחור מנוי חודשי, ואפשר גם לסגור את החנות אם אינכם מעוניינים להמשיך.";
}

export async function processTrialWarnings(now = Date.now()) {
  if (isBusinessTrialBypassed()) {
    return { skipped: true, sent: 0, reason: "trial-bypassed" as const };
  }

  const [warningsEnabled, closureEnabled] = await Promise.all([
    areTrialWarningEmailsEnabled(),
    isTrialClosureEnabled(),
  ]);

  if (!warningsEnabled || !closureEnabled) {
    return { skipped: true, sent: 0, reason: "disabled" as const };
  }

  const businesses = await prisma.business.findMany({
    where: {
      subscriptionActiveAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      subscriptionActiveAt: true,
      trialWarned7dAt: true,
      trialWarned3dAt: true,
      trialWarned1dAt: true,
      owner: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  let sent = 0;

  for (const business of businesses) {
    const status = getBusinessTrialStatus(business, now);
    if (status.expired || status.hasSubscription) continue;

    for (const stage of WARNING_STAGES) {
      if (business[stage.field]) continue;
      if (!stage.shouldSend(status.daysRemaining, status.expired)) continue;

      const mail = await sendTrialEndingWarningEmail(
        business.owner.email,
        business.name,
        stage.daysLeft,
        status.trialEndsAt
      );

      await dispatchOwnerPush(
        business.owner.id,
        pushCopy(stage.daysLeft, business.name)
      );

      await prisma.business.update({
        where: { id: business.id },
        data: {
          [stage.field]: new Date(),
          platformOwnerMessage: trialWarningPopupMessage(
            stage.daysLeft,
            status.trialEndsAt
          ),
          platformOwnerMessageAt: new Date(),
          platformOwnerMessageReadAt: null,
        },
      });

      sent += 1;
      console.log(
        `[trial-warnings] ${stage.daysLeft}d → ${business.name} (${business.owner.email}) sent=${mail.sent}`
      );
    }
  }

  // Trial-ended notice: queried separately (not `isActive: true`-gated) because a
  // dashboard visit right after expiry already flips `isActive` to false via
  // syncBusinessTrialLock, before this daily cron gets a chance to run.
  const expiredCandidates = await prisma.business.findMany({
    where: {
      subscriptionActiveAt: null,
      trialEndedNotifiedAt: null,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      subscriptionActiveAt: true,
      owner: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  for (const business of expiredCandidates) {
    const status = getBusinessTrialStatus(business, now);
    if (!status.expired || status.hasSubscription) continue;

    const mail = await sendTrialEndedEmail(business.owner.email, business.name);
    await dispatchOwnerPush(business.owner.id, trialEndedPushCopy(business.name));

    await prisma.business.update({
      where: { id: business.id },
      data: {
        trialEndedNotifiedAt: new Date(),
        platformOwnerMessage: trialEndedPopupMessage(),
        platformOwnerMessageAt: new Date(),
        platformOwnerMessageReadAt: null,
      },
    });

    sent += 1;
    console.log(
      `[trial-warnings] expired → ${business.name} (${business.owner.email}) sent=${mail.sent}`
    );
  }

  return {
    skipped: false,
    sent,
    businessesChecked: businesses.length + expiredCandidates.length,
  };
}

