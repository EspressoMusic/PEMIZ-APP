import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getStudioAccessPath,
  verifyStudioGateToken,
  STUDIO_GATE_COOKIE,
} from "@/lib/studio-access";

/** Blocks /master in production unless opened via the secret studio console URL. */
export async function assertMasterAccessAllowed() {
  if (process.env.NODE_ENV !== "production") return;
  if (!getStudioAccessPath()) notFound();
  const cookieStore = await cookies();
  const ok = await verifyStudioGateToken(
    cookieStore.get(STUDIO_GATE_COOKIE)?.value
  );
  if (!ok) notFound();
}
