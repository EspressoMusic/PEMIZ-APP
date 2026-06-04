import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizePhone } from "@/lib/phone";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  isStoreChatChannel,
  replySnippet,
  type StoreChatMessageDto,
} from "@/lib/store-chat";
import { publicChatPostSchema, zodFirstError } from "@/lib/validation/schemas";

const messageInclude = {
  replyTo: {
    select: { id: true, body: true, customerName: true },
  },
  likes: { select: { customerPhone: true } },
} as const;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const channelRaw = url.searchParams.get("channel") ?? "";
  if (!isStoreChatChannel(channelRaw)) {
    return jsonError("ערוץ לא תקין");
  }

  const viewerPhone = normalizePhone(url.searchParams.get("phone") ?? "");

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  if (channelRaw === "SELLER") {
    if (viewerPhone.length < 9) return jsonError("מספר טלפון לא תקין");

    const rows = await prisma.storeChatMessage.findMany({
      where: {
        businessId: business.id,
        channel: "SELLER",
        customerPhone: viewerPhone,
      },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: messageInclude,
    });
    return jsonOk({
      messages: rows.map((row) => toDto(row, viewerPhone)),
    });
  }

  const rows = await prisma.storeChatMessage.findMany({
    where: { businessId: business.id, channel: "COMMUNITY" },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: messageInclude,
  });
  return jsonOk({
    messages: rows.map((row) => toDto(row, viewerPhone)),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const limited = enforceRateLimit(req, "public:store-chat", 40, 60 * 60 * 1000);
  if (limited) return limited;

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  const body = await req.json().catch(() => null);
  const parsed = publicChatPostSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const phone = normalizePhone(parsed.data.customerPhone);
  if (phone.length < 9) return jsonError("מספר טלפון לא תקין");

  if (parsed.data.replyToId) {
    const parent = await prisma.storeChatMessage.findFirst({
      where: {
        id: parsed.data.replyToId,
        businessId: business.id,
        channel: parsed.data.channel,
      },
    });
    if (!parent) return jsonError("ההודעה לתגובה לא נמצאה");
  }

  const row = await prisma.storeChatMessage.create({
    data: {
      businessId: business.id,
      channel: parsed.data.channel,
      customerPhone: phone,
      customerName: parsed.data.customerName.trim(),
      authorRole: "CUSTOMER",
      body: parsed.data.body.trim(),
      replyToId: parsed.data.replyToId ?? null,
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
