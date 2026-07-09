import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductsManager } from "@/components/dashboard-client";
import { isScheduleLikeBusinessType } from "@/lib/types";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const mode = isScheduleLikeBusinessType(user.business.type)
    ? "services"
    : "products";

  return <ProductsManager mode={mode} />;
}
