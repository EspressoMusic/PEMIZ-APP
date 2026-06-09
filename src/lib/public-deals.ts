import type { Prisma } from "@prisma/client";
import { getDealLines, type DealProductRow } from "@/lib/store-deal";
import { publicCatalogImageUrl } from "@/lib/public-image-url";

export type PublicStoreDeal = {
  id: string;
  name: string;
  imageUrl: string | null;
  dealPrice: number;
  validUntil: string;
  createdAt: string;
  maxRedemptionsPerCustomer: number;
  products: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    salePrice: number | null;
    stock: number | null;
    quantity: number;
  }[];
};

type DealWithLines = {
  id: string;
  name: string;
  imageUrl: string | null;
  dealPrice: number;
  validUntil: Date;
  createdAt: Date;
  maxRedemptionsPerCustomer: number;
  items?: { sortOrder: number; quantity?: number; product: DealProductRow }[];
  productA?: DealProductRow | null;
  productB?: DealProductRow | null;
};

export function serializePublicStoreDeal(deal: DealWithLines): PublicStoreDeal {
  const lines = getDealLines(deal);
  return {
    id: deal.id,
    name: deal.name,
    imageUrl: publicCatalogImageUrl(deal.imageUrl ?? null),
    dealPrice: deal.dealPrice,
    validUntil: deal.validUntil.toISOString(),
    createdAt: deal.createdAt.toISOString(),
    maxRedemptionsPerCustomer: deal.maxRedemptionsPerCustomer ?? 1,
    products: lines.map((line) => ({
      id: line.product.id,
      name: line.product.name,
      imageUrl: publicCatalogImageUrl(line.product.imageUrl),
      price: line.product.price,
      salePrice: line.product.salePrice ?? null,
      stock: line.product.stock ?? null,
      quantity: line.quantity,
    })),
  };
}

export const publicDealInclude = {
  items: { include: { product: true }, orderBy: { sortOrder: "asc" as const } },
  productA: true,
  productB: true,
} satisfies Prisma.StoreDealInclude;
