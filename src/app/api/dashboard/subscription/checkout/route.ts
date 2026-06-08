import { z } from "zod";
import { jsonError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessTrialExpired } from "@/lib/business-trial";
import { zodFirstError } from "@/lib/validation/schemas";

const checkoutSchema = z.object({
  planId: z.enum(["premium", "ultimate"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);
  if (!user.business) return jsonError("אין עסק", 404);

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  if (!isBusinessTrialExpired(user.business)) {
    return jsonError("המנוי פעיל — אין צורך בתשלום כרגע", 400);
  }

  // Stripe / payment provider will plug in here.
  return jsonError("תשלום אונליין יתווסף בקרוב", 501);
}
