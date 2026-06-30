import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { getGrantedCustomerGoogleEmail } from "@/lib/customer-google-access";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business || !business.isActive) {
    return jsonError("עסק לא נמצא", 404);
  }

  const email = await getGrantedCustomerGoogleEmail(business.id);
  return jsonOk({ email });
}
