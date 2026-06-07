import { prisma } from "@/lib/prisma";

/** Remove a business and all dependent rows (handles product FKs on orders/deals). */
export async function deleteBusinessById(id: string) {
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({
      where: { order: { businessId: id } },
    });
    await tx.storeDealItem.deleteMany({
      where: { deal: { businessId: id } },
    });
    await tx.storeDeal.updateMany({
      where: { businessId: id },
      data: { productAId: null, productBId: null },
    });
    await tx.business.delete({ where: { id } });
  });
}
