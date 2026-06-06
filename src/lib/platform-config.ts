import { prisma } from "@/lib/prisma";

const CONFIG_ID = "default";

const DEFAULT_CONFIG = { id: CONFIG_ID, signupsEnabled: true };

import { isDatabaseConfigured } from "@/lib/db-env";
import { withDbTimeout } from "@/lib/db-query-timeout";

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
        create: { id: CONFIG_ID, signupsEnabled: true },
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

export async function setSignupsEnabled(enabled: boolean) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured");
  }
  return prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, signupsEnabled: enabled },
    update: { signupsEnabled: enabled },
  });
}
