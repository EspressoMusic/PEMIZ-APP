import { prisma } from "@/lib/prisma";
import { getBusinessTrialStatus } from "@/lib/business-trial";
import {
  areTrialWarningEmailsEnabled,
  isTrialClosureEnabled,
} from "@/lib/trial-enforcement";
import {
  sendTrialEndingWarningEmail,
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

function pushCopy(daysLeft: TrialWarningDaysLeft, storeName: string) {
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

export async function processTrialWarnings(now = Date.now()) {
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
        data: { [stage.field]: new Date() },
      });

      sent += 1;
      console.log(
        `[trial-warnings] ${stage.daysLeft}d → ${business.name} (${business.owner.email}) sent=${mail.sent}`
      );
    }
  }

  return { skipped: false, sent, businessesChecked: businesses.length };
}

