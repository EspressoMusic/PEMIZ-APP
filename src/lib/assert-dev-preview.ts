import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifyStudioGateToken, STUDIO_GATE_COOKIE } from "@/lib/studio-access";

/** Blocks /dev in production unless the studio gate cookie was set via the secret URL. */
export async function assertDevPreviewAllowed() {
  if (process.env.NODE_ENV !== "production") return;
  const cookieStore = await cookies();
  const ok = await verifyStudioGateToken(
    cookieStore.get(STUDIO_GATE_COOKIE)?.value
  );
  if (!ok) notFound();
}
