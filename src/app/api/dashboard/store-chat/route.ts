import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { normalizePhone } from "@/lib/phone";
import type { StoreChatMessageDto } from "@/lib/store-chat";

const postSchema = z.object({
  customerPhone: z.string().min(9).max(20),
  body: z.string().min(1).max(2000),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const phone = normalizePhone(
    new URL(req.url).searchParams.get("phone") ?? ""
  );
  if (phone.length >= 9) {
    const rows = await prisma.storeChatMessage.findMany({
      where: {
        businessId: user.business.id,
        channel: "SELLER",
        customerPhone: phone,
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return jsonOk({ messages: rows.map(toDto) });
  }

  const rows = await prisma.storeChatMessage.findMany({
    where: {
      businessId: user.business.id,
      channel: "SELLER",
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const threadMap = new Map<
    string,
    {
      customerPhone: string;
      customerName: string;
      lastMessage: string;
      lastAt: string;
      unreadFromCustomer: boolean;
    }
  >();

  for (const row of rows) {
    const phone = row.customerPhone ?? "";
    if (!phone) continue;
    const existing = threadMap.get(phone);
    const isCustomer = row.authorRole === "CUSTOMER";
    if (!existing) {
      threadMap.set(phone, {
        customerPhone: phone,
        customerName: row.customerName,
        lastMessage: row.body,
        lastAt: row.createdAt.toISOString(),
        unreadFromCustomer: isCustomer,
      });
    } else if (new Date(row.createdAt) > new Date(existing.lastAt)) {
      existing.lastMessage = row.body;
      existing.lastAt = row.createdAt.toISOString();
      if (isCustomer) existing.unreadFromCustomer = true;
    }
  }

  const threads = [...threadMap.values()].sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  return jsonOk({ threads });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
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
      customerName: lastCustomer?.customerName ?? user.business.name,
      authorRole: "SELLER",
      body: parsed.data.body.trim(),
    },
  });

  return jsonOk({ message: toDto(row) });
}

function toDto(row: {
  id: string;
  channel: string;
  customerPhone: string | null;
  customerName: string;
  authorRole: string;
  body: string;
  createdAt: Date;
}): StoreChatMessageDto {
  return {
    id: row.id,
    channel: row.channel as StoreChatMessageDto["channel"],
    customerPhone: row.customerPhone,
    customerName: row.customerName,
    authorRole: row.authorRole as StoreChatMessageDto["authorRole"],
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}
