import type { StoreChatChannel, StoreChatMessageDto } from "@/lib/store-chat";
import { normalizePhone } from "@/lib/phone";

function storageKey(slug: string, channel: StoreChatChannel) {
  return `linky-store-chat-${slug}-${channel}`;
}

export function loadDevStoreChat(
  slug: string,
  channel: StoreChatChannel
): StoreChatMessageDto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(slug, channel));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoreChatMessageDto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDevStoreChat(
  slug: string,
  channel: StoreChatChannel,
  list: StoreChatMessageDto[]
) {
  localStorage.setItem(storageKey(slug, channel), JSON.stringify(list));
}

export function appendDevStoreChat(
  slug: string,
  channel: StoreChatChannel,
  message: StoreChatMessageDto
) {
  const list = loadDevStoreChat(slug, channel);
  list.push(message);
  saveDevStoreChat(slug, channel, list);
}

export function filterDevSellerChat(
  messages: StoreChatMessageDto[],
  phone: string
) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 9) return [];
  return messages.filter(
    (m) =>
      m.channel === "SELLER" &&
      (m.authorRole === "SELLER" ||
        normalizePhone(m.customerPhone ?? "") === normalized)
  );
}

export function enrichDevCommunityMessages(
  messages: StoreChatMessageDto[],
  viewerPhone: string
): StoreChatMessageDto[] {
  const phone = normalizePhone(viewerPhone);
  const byId = new Map(messages.map((m) => [m.id, m]));

  return messages.map((m) => {
    const likedBy =
      phone.length >= 9 &&
      (m.likedByPhones ?? []).some((p) => normalizePhone(p) === phone);
    const replySource = m.replyToId ? byId.get(m.replyToId) : undefined;
    return {
      ...m,
      likeCount: m.likedByPhones?.length ?? m.likeCount ?? 0,
      likedByMe: likedBy,
      replyTo: replySource
        ? {
            id: replySource.id,
            customerName: replySource.customerName,
            body:
              replySource.body.length > 80
                ? `${replySource.body.slice(0, 80)}…`
                : replySource.body,
          }
        : m.replyTo ?? null,
    };
  });
}

export function ensureDevSellerChatSeed(
  slug: string,
  seed: StoreChatMessageDto[]
) {
  const existing = loadDevStoreChat(slug, "SELLER");
  if (existing.length > 0) return;
  saveDevStoreChat(slug, "SELLER", seed);
}

export function appendDevSellerChatMessage(
  slug: string,
  message: StoreChatMessageDto
) {
  appendDevStoreChat(slug, "SELLER", message);
}

export function toggleDevCommunityLike(
  slug: string,
  messageId: string,
  viewerPhone: string
): boolean {
  const list = loadDevStoreChat(slug, "COMMUNITY");
  const phone = normalizePhone(viewerPhone);
  const idx = list.findIndex((m) => m.id === messageId);
  if (idx < 0) return false;

  const msg = list[idx]!;
  const likes = new Set(
    (msg.likedByPhones ?? []).map((p) => normalizePhone(p))
  );
  let liked: boolean;
  if (likes.has(phone)) {
    likes.delete(phone);
    liked = false;
  } else {
    likes.add(phone);
    liked = true;
  }
  list[idx] = {
    ...msg,
    likedByPhones: [...likes],
    likeCount: likes.size,
    likedByMe: liked,
  };
  saveDevStoreChat(slug, "COMMUNITY", list);
  return liked;
}
