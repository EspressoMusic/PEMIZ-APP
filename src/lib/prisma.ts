import { PrismaClient } from "@prisma/client";

/** Allow DATABASE_URL when POSTGRES_PRISMA_URL is missing (local .env) */
if (!process.env.POSTGRES_PRISMA_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL;
}
if (
  !process.env.POSTGRES_URL_NON_POOLING?.trim() &&
  process.env.POSTGRES_URL?.trim()
) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.POSTGRES_URL;
}
if (!process.env.POSTGRES_URL_NON_POOLING?.trim() && process.env.DIRECT_URL?.trim()) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DIRECT_URL;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
