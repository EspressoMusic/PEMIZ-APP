import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { normalizePhone } from "@/lib/phone";
import { buildSellerChatThreads } from "@/lib/seller-chat-threads";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  STORE_CHAT_LIST_LIMIT,
  storeChatMessageInclude,
  storeChatRowToDto,
} from "@/lib/store-chat-query";
import {
  sellerPrivateChatReplySchema,
  zodFirstError,
} from "@/lib/validation/schemas";

export async function GET(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const url = new URL(req.url);
  const phone = normalizePhone(url.searchParams.get("phone") ?? "");
  if (phone.length >= 9) {
    const rows = await prisma.storeChatMessage.findMany({
      where: {
        businessId: ctx.user.business.id,
        channel: "SELLER",
        customerPhone: phone,
      },
      orderBy: { createdAt: "asc" },
      take: STORE_CHAT_LIST_LIMIT,
      include: storeChatMessageInclude,
    });
    return jsonOk({ messages: rows.map((row) => storeChatRowToDto(row)) });
  }

  const rows = await prisma.storeChatMessage.findMany({
    where: {
      businessId: ctx.user.business.id,
      channel: "SELLER",
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const threads = buildSellerChatThreads(rows);
  return jsonOk({ threads });
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "dashboard:store-chat", 60, 60 * 60 * 1000);
  if (limited) return limited;

  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = sellerPrivateChatReplySchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const phone = normalizePhone(parsed.data.customerPhone);
  if (phone.length < 9) return jsonError("מספר טלפון לא תקין");

  const lastCustomer = await prisma.storeChatMessage.findFirst({
    where: {
      businessId: ctx.user.business.id,
      channel: "SELLER",
      customerPhone: phone,
      authorRole: "CUSTOMER",
    },
    orderBy: { createdAt: "desc" },
  });

  const row = await prisma.storeChatMessage.create({
    data: {
      businessId: ctx.user.business.id,
      channel: "SELLER",
      customerPhone: phone,
      customerName: lastCustomer?.customerName ?? "לקוח",
      authorRole: "SELLER",
      body: parsed.data.body.trim(),
    },
    include: storeChatMessageInclude,
  });

  return jsonOk({ message: storeChatRowToDto(row) });
}
