import { Prisma } from "@prisma/client";
import { publicSystemErrorMessage } from "@/lib/public-errors";

export type ServerErrorDetail = {
  publicMessage: string;
  developerMessage: string;
  status: number;
  code?: string;
};

export function prismaErrorDetail(error: unknown): ServerErrorDetail {
  const publicMessage = publicSystemErrorMessage("he");

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      publicMessage,
      developerMessage: `Prisma initialization failed: ${error.message}`,
      status: 503,
      code: "PRISMA_INIT",
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P1000":
      case "P1001":
      case "P1017":
        return {
          publicMessage,
          developerMessage: `Database unavailable (${error.code}): ${error.message}`,
          status: 503,
          code: error.code,
        };
      case "P2021": {
        const table = (error.meta?.table as string | undefined) ?? "";
        return {
          publicMessage,
          developerMessage: table
            ? `Missing table in database (${table}). Run: npm run migrate`
            : "Missing tables in database. Run: npm run migrate",
          status: 503,
          code: error.code,
        };
      }
      case "P2022": {
        const column = (error.meta?.column as string | undefined) ?? "";
        const table = (error.meta?.table as string | undefined) ?? "";
        const detail = [table, column].filter(Boolean).join(" · ");
        return {
          publicMessage,
          developerMessage: detail
            ? `Missing column in database (${detail}). Run: npm run migrate`
            : "Database schema mismatch. Run: npm run migrate",
          status: 503,
          code: error.code,
        };
      }
      default:
        return {
          publicMessage,
          developerMessage: `Prisma error ${error.code}: ${error.message}`,
          status: 500,
          code: error.code,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      publicMessage,
      developerMessage: `Prisma panic: ${error.message}`,
      status: 503,
      code: "PRISMA_PANIC",
    };
  }

  if (error instanceof Error) {
    return {
      publicMessage,
      developerMessage: error.message,
      status: 500,
    };
  }

  return {
    publicMessage,
    developerMessage: String(error),
    status: 500,
  };
}

export function formatServerError(error: unknown): ServerErrorDetail {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return prismaErrorDetail(error);
  }

  if (error instanceof Error) {
    return prismaErrorDetail(error);
  }

  return prismaErrorDetail(error);
}
