import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  clearCustomerGoogleAccess,
  getGrantedCustomerGoogleEmail,
} from "@/lib/customer-google-access";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);

  const email = await getGrantedCustomerGoogleEmail(business.id);
  if (email) await clearCustomerGoogleAccess();

  return jsonOk({ ok: true });
}
