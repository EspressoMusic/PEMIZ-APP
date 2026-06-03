import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { STORE_THEME_IDS } from "@/lib/store-themes";

const schema = z.object({
  storeTheme: z.enum(STORE_THEME_IDS).optional(),
  storeLocale: z.enum(["he", "en"]).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const b = user.business;
  return jsonOk({
    storeTheme: b.storeTheme,
    storeLocale: b.storeLocale === "en" ? "en" : "he",
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");
  if (!parsed.data.storeTheme && !parsed.data.storeLocale) {
    return jsonError("אין נתונים לעדכון");
  }

  const updated = await prisma.business.update({
    where: { id: user.business.id },
    data: {
      ...(parsed.data.storeTheme != null
        ? { storeTheme: parsed.data.storeTheme }
        : {}),
      ...(parsed.data.storeLocale != null
        ? { storeLocale: parsed.data.storeLocale }
        : {}),
    },
    select: { storeTheme: true, storeLocale: true },
  });

  return jsonOk({
    storeTheme: updated.storeTheme,
    storeLocale: updated.storeLocale === "en" ? "en" : "he",
  });
}
