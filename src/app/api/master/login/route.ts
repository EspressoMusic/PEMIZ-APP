import { jsonError } from "@/lib/api";

/** Master access is via the secret studio URL only — no key login. */
export async function POST() {
  return jsonError("לא זמין", 404);
}
