import { isSignupEnabled } from "@/lib/platform-config";
import { jsonOk } from "@/lib/api";

export async function GET() {
  const signupsEnabled = await isSignupEnabled();
  return jsonOk({ signupsEnabled });
}
