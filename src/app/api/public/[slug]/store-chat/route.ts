import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isStoreChatChannel } from "@/lib/store-chat";
import {
  STORE_CHAT_LIST_LIMIT,
  storeChatMessageInclude,
  storeChatRowToDto,
} from "@/lib/store-chat-query";
import { publicChatPostSchema, zodFirstError } from "@/lib/validation/schemas";
import { notifySellerChat } from "@/lib/seller-push";
import { isStorePanelEnabled } from "@/lib/store-panels-visible";

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

  const viewerPhone = parseIsraeliMobilePhone(
    url.searchParams.get("phone") ?? ""
  );

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true, storePanelsVisible: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);
  if (!isStorePanelEnabled(business, "chat")) {
    return jsonError("צ'אט לא זמין בחנות זו", 403);
  }

  if (!viewerPhone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const rows = await prisma.storeChatMessage.findMany({
    where: {
      businessId: business.id,
      channel: "SELLER",
      customerPhone: viewerPhone,
    },
    orderBy: { createdAt: "asc" },
    take: STORE_CHAT_LIST_LIMIT,
    include: storeChatMessageInclude,
  });
  return jsonOk({
    messages: rows.map((row) => storeChatRowToDto(row)),
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
    select: { id: true, isActive: true, storePanelsVisible: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);
  if (!isStorePanelEnabled(business, "chat")) {
    return jsonError("צ'אט לא זמין בחנות זו", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = publicChatPostSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const phone = parseIsraeliMobilePhone(parsed.data.customerPhone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const row = await prisma.storeChatMessage.create({
    data: {
      businessId: business.id,
      channel: "SELLER",
      customerPhone: phone,
      customerName: parsed.data.customerName.trim(),
      authorRole: "CUSTOMER",
      body: parsed.data.body.trim(),
    },
    include: storeChatMessageInclude,
  });

  void notifySellerChat(business.id, {
    id: row.id,
    customerName: row.customerName,
    body: row.body,
  });

  return jsonOk({ message: storeChatRowToDto(row) });
}
