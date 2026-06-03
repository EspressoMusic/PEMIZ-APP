export type SellerChatThread = {
  customerPhone: string;
  customerName: string;
  lastMessage: string;
  lastAt: string;
  unreadFromCustomer: boolean;
};

type ThreadRow = {
  customerPhone: string | null;
  customerName: string;
  authorRole: string;
  body: string;
  createdAt: Date | string;
};

export function buildSellerChatThreads(rows: ThreadRow[]): SellerChatThread[] {
  const threadMap = new Map<string, SellerChatThread>();

  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const row of sorted) {
    const phone = row.customerPhone ?? "";
    if (!phone) continue;
    const isCustomer = row.authorRole === "CUSTOMER";
    const at =
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt);

    const existing = threadMap.get(phone);
    if (!existing) {
      threadMap.set(phone, {
        customerPhone: phone,
        customerName: row.customerName,
        lastMessage: row.body,
        lastAt: at,
        unreadFromCustomer: isCustomer,
      });
    }
  }

  return [...threadMap.values()].sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );
}
