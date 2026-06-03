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
  orderData: Omit<Prisma.OrderCreateInput, "items" | "business">
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
    if (product?.stock != null) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  return tx.order.create({
    data: {
      ...orderData,
      businessId,
      items: { create: orderItems },
    },
    include: { items: true },
  });
}
