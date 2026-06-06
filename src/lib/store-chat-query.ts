import { replySnippet, type StoreChatMessageDto } from "@/lib/store-chat";

export const STORE_CHAT_LIST_LIMIT = 100;

export const storeChatMessageInclude = {
  replyTo: {
    select: { id: true, body: true, customerName: true },
  },
} as const;

type ChatRow = {
  id: string;
  channel: string;
  customerPhone: string | null;
  customerName: string;
  authorRole: string;
  body: string;
  createdAt: Date;
  replyTo: { id: string; body: string; customerName: string } | null;
};

export function storeChatRowToDto(row: ChatRow): StoreChatMessageDto {
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
  };
}

export function chatMessagesEqual(
  a: StoreChatMessageDto[],
  b: StoreChatMessageDto[]
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.id !== y.id || x.body !== y.body) return false;
  }
  return true;
}
