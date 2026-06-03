import { Prisma } from "@prisma/client";

/** הודעות בעברית ברורות לשגיאות Prisma — לא "שגיאת חיבור" גנרית */
export function prismaErrorResponse(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      message:
        "לא הצלחנו להתחבר למסד הנתונים. בדוק ב-Vercel או ב-.env.local את POSTGRES_PRISMA_URL ו-POSTGRES_URL_NON_POOLING.",
      status: 503,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P1000":
      case "P1001":
      case "P1017":
        return {
          message: "מסד הנתונים לא זמין כרגע. נסה שוב בעוד רגע.",
          status: 503,
        };
      case "P2021": {
        const table = (error.meta?.table as string | undefined) ?? "";
        return {
          message: table
            ? `חסרה טבלה במסד (${table}). הרץ: npm run db:migrate`
            : "טבלאות חסרות במסד. הרץ: npm run db:migrate",
          status: 503,
        };
      }
      case "P2022": {
        const column = (error.meta?.column as string | undefined) ?? "";
        const table = (error.meta?.table as string | undefined) ?? "";
        const detail = [table, column].filter(Boolean).join(" · ");
        return {
          message: detail
            ? `חסרה עמודה במסד (${detail}). הרץ: npm run db:migrate`
            : "מבנה מסד הנתונים לא תואם לקוד. הרץ: npm run db:migrate",
          status: 503,
        };
      }
      default:
        break;
    }
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      message: "שגיאה פנימית במסד הנתונים. נסה שוב.",
      status: 503,
    };
  }

  return {
    message: "משהו השתבש בשרת. נסה שוב בעוד רגע.",
    status: 500,
  };
}
