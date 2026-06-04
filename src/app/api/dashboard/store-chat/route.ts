import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { normalizePhone } from "@/lib/phone";
import { buildSellerChatThreads } from "@/lib/seller-chat-threads";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { replySnippet, type StoreChatMessageDto } from "@/lib/store-chat";
import {
  sellerCommunityChatPostSchema,
  sellerPrivateChatReplySchema,
  zodFirstError,
} from "@/lib/validation/schemas";

const messageInclude = {
  replyTo: {
    select: { id: true, body: true, customerName: true },
  },
  likes: { select: { customerPhone: true } },
} as const;

export async function GET(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const url = new URL(req.url);
  const channel = url.searchParams.get("channel");

  if (channel === "COMMUNITY") {
    const rows = await prisma.storeChatMessage.findMany({
      where: {
        businessId: ctx.user.business.id,
        channel: "COMMUNITY",
      },
      orderBy: { createdAt: "asc" },
      take: 300,
      include: messageInclude,
    });
    return jsonOk({
      messages: rows.map((row) => toDto(row, "")),
    });
  }

  const phone = normalizePhone(url.searchParams.get("phone") ?? "");
  if (phone.length >= 9) {
    const rows = await prisma.storeChatMessage.findMany({
      where: {
        businessId: ctx.user.business.id,
        channel: "SELLER",
        customerPhone: phone,
      },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: messageInclude,
    });
    return jsonOk({ messages: rows.map((row) => toDto(row, phone)) });
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
  if (!body || typeof body !== "object") return jsonError("נתונים לא תקינים");

  if ((body as { channel?: string }).channel === "COMMUNITY") {
    const parsed = sellerCommunityChatPostSchema.safeParse(body);
    if (!parsed.success) return jsonError(zodFirstError(parsed));

    if (parsed.data.replyToId) {
      const parent = await prisma.storeChatMessage.findFirst({
        where: {
          id: parsed.data.replyToId,
          businessId: ctx.user.business.id,
          channel: "COMMUNITY",
        },
      });
      if (!parent) return jsonError("ההודעה לתגובה לא נמצאה");
    }

    const row = await prisma.storeChatMessage.create({
      data: {
        businessId: ctx.user.business.id,
        channel: "COMMUNITY",
        customerPhone: null,
        customerName: ctx.user.business.name,
        authorRole: "SELLER",
        body: parsed.data.body.trim(),
        replyToId: parsed.data.replyToId ?? null,
      },
      include: messageInclude,
    });

    return jsonOk({ message: toDto(row, "") });
  }

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
    include: messageInclude,
  });

  return jsonOk({ message: toDto(row, phone) });
}

function toDto(
  row: {
    id: string;
    channel: string;
    customerPhone: string | null;
    customerName: string;
    authorRole: string;
    body: string;
    createdAt: Date;
    replyTo: { id: string; body: string; customerName: string } | null;
    likes: { customerPhone: string }[];
  },
  viewerPhone: string
): StoreChatMessageDto {
  return {
    id: row.id,
    channel: row.channel as StoreChatMessageDto["channel"],
    customerPhone: row.customerPhone,
    customerName: row.customerName,
    authorRole: row.authorRole as StoreChatMessageDto["authorRole"],
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    replyTo: row.replyTo
      ? {
          id: row.replyTo.id,
          customerName: row.replyTo.customerName,
          body: replySnippet(row.replyTo.body),
        }
      : null,
    likeCount: row.likes.length,
    likedByMe:
      viewerPhone.length >= 9 &&
      row.likes.some((l) => l.customerPhone === viewerPhone),
  };
}
