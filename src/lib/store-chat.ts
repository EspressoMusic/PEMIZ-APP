export const STORE_CHAT_CHANNELS = ["SELLER", "COMMUNITY"] as const;
export type StoreChatChannel = (typeof STORE_CHAT_CHANNELS)[number];

export const STORE_CHAT_ROLES = ["CUSTOMER", "SELLER"] as const;
export type StoreChatAuthorRole = (typeof STORE_CHAT_ROLES)[number];

export type StoreChatReplyPreview = {
  id: string;
  customerName: string;
  body: string;
};

export type StoreChatMessageDto = {
  id: string;
  channel: StoreChatChannel;
  customerPhone: string | null;
  customerName: string;
  authorRole: StoreChatAuthorRole;
  body: string;
  createdAt: string;
  replyTo?: StoreChatReplyPreview | null;
  likeCount?: number;
  likedByMe?: boolean;
  /** Dev preview only — persisted in localStorage */
  likedByPhones?: string[];
  replyToId?: string | null;
};

export function isStoreChatChannel(value: string): value is StoreChatChannel {
  return value === "SELLER" || value === "COMMUNITY";
}

export function replySnippet(body: string, max = 80) {
  const t = body.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
