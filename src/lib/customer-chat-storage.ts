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

export function updateDevStoreChatResolution(
  slug: string,
  channel: StoreChatChannel,
  messageId: string,
  resolution: "RESOLVED" | "NOT_RESOLVED"
): StoreChatMessageDto[] {
  const list = loadDevStoreChat(slug, channel);
  const next = list.map((message) =>
    message.id === messageId
      ? {
          ...message,
          customerResolution: resolution,
          customerResolutionAt: new Date().toISOString(),
        }
      : message
  );
  saveDevStoreChat(slug, channel, next);
  return next;
}
