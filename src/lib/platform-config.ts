import { prisma } from "@/lib/prisma";

const CONFIG_ID = "default";

export async function getPlatformConfig() {
  return prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, signupsEnabled: true },
    update: {},
  });
}

export async function isSignupEnabled() {
  const config = await getPlatformConfig();
  return config.signupsEnabled;
}

export async function setSignupsEnabled(enabled: boolean) {
  return prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, signupsEnabled: enabled },
    update: { signupsEnabled: enabled },
  });
}
