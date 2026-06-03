import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  storeTheme: z.enum(["calm", "light", "dark"]),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  await prisma.business.update({
    where: { id: user.business.id },
    data: { storeTheme: parsed.data.storeTheme },
  });

  return jsonOk({ storeTheme: parsed.data.storeTheme });
}
