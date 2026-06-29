import type { Prisma } from "@prisma/client";
import { canFulfillQuantity, OUT_OF_STOCK_MESSAGE } from "@/lib/product-stock";

export class OrderStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderStockError";
  }
}

export type OrderLineInput = {
  productId: string;
  quantity: number;
  priceAtOrder: number;
};

export async function reserveStockAndCreateOrder(
  tx: Prisma.TransactionClient,
  businessId: string,
  orderItems: OrderLineInput[],
  orderData: Omit<
    Prisma.OrderCreateInput,
    "items" | "business" | "orderNumber" | "businessId"
  >
) {
  for (const item of orderItems) {
    const product = await tx.product.findFirst({
      where: { id: item.productId, businessId, isActive: true },
    });
    if (!product) throw new OrderStockError("מוצר לא תקין");
    if (!canFulfillQuantity(product.stock, item.quantity)) {
      throw new OrderStockError(OUT_OF_STOCK_MESSAGE);
    }
  }

  for (const item of orderItems) {
    const product = await tx.product.findFirst({
      where: { id: item.productId },
      select: { stock: true },
    });
    if (product?.stock == null) continue;

    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.quantity },
      },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count === 0) {
      throw new OrderStockError(OUT_OF_STOCK_MESSAGE);
    }
  }

  const business = await tx.business.update({
    where: { id: businessId },
    data: { nextOrderNumber: { increment: 1 } },
    select: { nextOrderNumber: true },
  });
  const orderNumber = business.nextOrderNumber - 1;

  return tx.order.create({
    data: {
      ...orderData,
      businessId,
      orderNumber,
      items: { create: orderItems },
    },
    include: { items: true },
  });
}
