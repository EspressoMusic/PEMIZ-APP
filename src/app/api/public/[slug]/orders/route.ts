import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().min(9).max(20),
  customerEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    include: { products: { where: { isActive: true } } },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("This business is currently unavailable.", 403);
  if (business.type !== "STORE") return jsonError("עסק זה אינו מקבל הזמנות", 400);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const orderItems: { productId: string; quantity: number; priceAtOrder: number }[] = [];
  for (const item of parsed.data.items) {
    const product = business.products.find((p) => p.id === item.productId);
    if (!product) return jsonError("מוצר לא תקין");
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      priceAtOrder: product.price,
    });
  }

  const order = await prisma.order.create({
    data: {
      businessId: business.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      notes: parsed.data.notes,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return jsonOk({ orderId: order.id });
}
