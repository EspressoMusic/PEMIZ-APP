import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";
import type { NextResponse } from "next/server";

export async function findOwnedProduct(businessId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, businessId },
  });
}

export async function findOwnedDeal(businessId: string, dealId: string) {
  return prisma.storeDeal.findFirst({
    where: { id: dealId, businessId },
  });
}

export async function findOwnedInquiry(businessId: string, inquiryId: string) {
  return prisma.inquiry.findFirst({
    where: { id: inquiryId, businessId },
  });
}

export async function findOwnedSlot(businessId: string, slotId: string) {
  return prisma.appointmentSlot.findFirst({
    where: { id: slotId, businessId },
  });
}

export async function findOwnedFaq(businessId: string, faqId: string) {
  return prisma.faqItem.findFirst({
    where: { id: faqId, businessId },
  });
}

export function notFoundOrForbidden(): NextResponse {
  return jsonError("לא נמצא", 404);
}
