import { prisma } from "@/lib/prisma";

const CONFIG_ID = "default";

const DEFAULT_CONFIG = {
  id: CONFIG_ID,
  signupsEnabled: true,
  trialClosureEnabled: true,
  trialWarningEmailsEnabled: true,
  maxAppointmentsPerBusiness: 100,
  maxOrderItemsPerOrder: 200,
};

import { isDatabaseConfigured } from "@/lib/db-env";
import { withDbTimeout } from "@/lib/db-query-timeout";

export type PlatformConfigFlags = {
  signupsEnabled: boolean;
  trialClosureEnabled: boolean;
  trialWarningEmailsEnabled: boolean;
  maxAppointmentsPerBusiness: number;
  maxOrderItemsPerOrder: number;
};

function hasDatabaseUrl() {
  return isDatabaseConfigured();
}

export async function getPlatformConfig() {
  if (!hasDatabaseUrl()) {
    return DEFAULT_CONFIG;
  }
  try {
    return await withDbTimeout(
      prisma.platformConfig.upsert({
        where: { id: CONFIG_ID },
        create: {
          id: CONFIG_ID,
          signupsEnabled: true,
          trialClosureEnabled: true,
          trialWarningEmailsEnabled: true,
          maxAppointmentsPerBusiness: 100,
          maxOrderItemsPerOrder: 200,
        },
        update: {},
      })
    );
  } catch (err) {
    console.error("[platform-config] DB unavailable, using defaults", err);
    return DEFAULT_CONFIG;
  }
}

export async function isSignupEnabled() {
  const config = await getPlatformConfig();
  return config.signupsEnabled;
}

export async function updatePlatformConfig(
  patch: Partial<PlatformConfigFlags>
) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured");
  }
  return prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: {
      id: CONFIG_ID,
      signupsEnabled: patch.signupsEnabled ?? true,
      trialClosureEnabled: patch.trialClosureEnabled ?? true,
      trialWarningEmailsEnabled: patch.trialWarningEmailsEnabled ?? true,
      maxAppointmentsPerBusiness: patch.maxAppointmentsPerBusiness ?? 100,
      maxOrderItemsPerOrder: patch.maxOrderItemsPerOrder ?? 200,
    },
    update: patch,
  });
}

export async function setSignupsEnabled(enabled: boolean) {
  return updatePlatformConfig({ signupsEnabled: enabled });
}
