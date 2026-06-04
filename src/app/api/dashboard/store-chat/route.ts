import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizePhone } from "@/lib/phone";
import { buildSellerChatThreads } from "@/lib/seller-chat-threads";
import { replySnippet, type StoreChatMessageDto } from "@/lib/store-chat";

const privateReplySchema = z.object({
  customerPhone: z.string().min(9).max(20),
  body: z.string().min(1).max(2000),
});

const communityPostSchema = z.object({
  channel: z.literal("COMMUNITY"),
  body: z.string().min(1).max(2000),
  replyToId: z.string().optional(),
});

const messageInclude = {
  replyTo: {
    select: { id: true, body: true, customerName: true },
  },
  likes: { select: { customerPhone: true } },
} as const;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const url = new URL(req.url);
  const channel = url.searchParams.get("channel");

  if (channel === "COMMUNITY") {
    const rows = await prisma.storeChatMessage.findMany({
      where: {
        businessId: user.business.id,
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
        businessId: user.business.id,
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
      businessId: user.business.id,
      channel: "SELLER",
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const threads = buildSellerChatThreads(rows);
  return jsonOk({ threads });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("נתונים לא תקינים");

  if ((body as { channel?: string }).channel === "COMMUNITY") {
    const parsed = communityPostSchema.safeParse(body);
    if (!parsed.success) return jsonError("נתונים לא תקינים");

    if (parsed.data.replyToId) {
      const parent = await prisma.storeChatMessage.findFirst({
        where: {
          id: parsed.data.replyToId,
          businessId: user.business.id,
          channel: "COMMUNITY",
        },
      });
      if (!parent) return jsonError("ההודעה לתגובה לא נמצאה");
    }

    const row = await prisma.storeChatMessage.create({
      data: {
        businessId: user.business.id,
        channel: "COMMUNITY",
        customerPhone: null,
        customerName: user.business.name,
        authorRole: "SELLER",
        body: parsed.data.body.trim(),
        replyToId: parsed.data.replyToId ?? null,
      },
      include: messageInclude,
    });

    return jsonOk({ message: toDto(row, "") });
  }

  const parsed = privateReplySchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = normalizePhone(parsed.data.customerPhone);
  if (phone.length < 9) return jsonError("מספר טלפון לא תקין");

  const lastCustomer = await prisma.storeChatMessage.findFirst({
    where: {
      businessId: user.business.id,
      channel: "SELLER",
      customerPhone: phone,
      authorRole: "CUSTOMER",
    },
    orderBy: { createdAt: "desc" },
  });

  const row = await prisma.storeChatMessage.create({
    data: {
      businessId: user.business.id,
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
