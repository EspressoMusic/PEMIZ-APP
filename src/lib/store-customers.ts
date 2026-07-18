export type StoreCustomerSummary = {
  phoneKey: string;
  customerPhone: string;
  customerName: string;
  customerAddress: string | null;
  orderCount: number;
  firstOrderAt: string;
  lastOrderAt: string;
};

export type CustomerProfile = {
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  orderCount: number | null;
};

export function resolveCustomerProfile(
  orders: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    createdAt?: string;
    status: string;
  }[],
  input: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    fallbackDate?: string;
  },
  anonymousLabel: string
): CustomerProfile | null {
  const phone = input.customerPhone?.trim();
  if (!phone) return null;

  const phoneKey = normalizeCustomerPhone(phone);
  const match = aggregateStoreCustomers(orders, anonymousLabel).find(
    (customer) => customer.phoneKey === phoneKey
  );

  if (match) {
    return {
      customerName: match.customerName,
      customerPhone: match.customerPhone,
      customerAddress: match.customerAddress ?? input.customerAddress ?? null,
      firstOrderAt: match.firstOrderAt,
      lastOrderAt: match.lastOrderAt,
      orderCount: match.orderCount,
    };
  }

  const fallback = input.fallbackDate ?? null;
  return {
    customerName: getCustomerDisplayName(input.customerName, anonymousLabel),
    customerPhone: phone,
    customerAddress: input.customerAddress ?? null,
    firstOrderAt: fallback,
    lastOrderAt: fallback,
    orderCount: null,
  };
}

export function normalizeCustomerPhone(phone: string) {
  return phone.replace(/\s/g, "");
}

export function getCustomerDisplayName(
  name: string,
  anonymousLabel: string
): string {
  const trimmed = name.trim();
  return trimmed || anonymousLabel;
}

export function aggregateStoreCustomers(
  orders: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    createdAt?: string;
    status: string;
  }[],
  anonymousLabel: string
): StoreCustomerSummary[] {
  const byPhone = new Map<string, StoreCustomerSummary>();

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;

    const phoneKey = normalizeCustomerPhone(order.customerPhone);
    if (!phoneKey) continue;

    const createdAt = order.createdAt ?? new Date(0).toISOString();
    const existing = byPhone.get(phoneKey);

    if (!existing) {
      byPhone.set(phoneKey, {
        phoneKey,
        customerPhone: order.customerPhone,
        customerName: getCustomerDisplayName(order.customerName, anonymousLabel),
        customerAddress: order.customerAddress?.trim() || null,
        orderCount: 1,
        firstOrderAt: createdAt,
        lastOrderAt: createdAt,
      });
      continue;
    }

    existing.orderCount += 1;

    if (new Date(createdAt).getTime() < new Date(existing.firstOrderAt).getTime()) {
      existing.firstOrderAt = createdAt;
    }

    if (new Date(createdAt).getTime() > new Date(existing.lastOrderAt).getTime()) {
      existing.lastOrderAt = createdAt;
      existing.customerPhone = order.customerPhone;
      const name = getCustomerDisplayName(order.customerName, anonymousLabel);
      if (name !== anonymousLabel) {
        existing.customerName = name;
      }
      if (order.customerAddress?.trim()) {
        existing.customerAddress = order.customerAddress.trim();
      }
    } else if (
      existing.customerName === anonymousLabel &&
      order.customerName.trim()
    ) {
      existing.customerName = order.customerName.trim();
    } else if (!existing.customerAddress && order.customerAddress?.trim()) {
      existing.customerAddress = order.customerAddress.trim();
    }
  }

  return [...byPhone.values()].sort(
    (a, b) =>
      new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );
}
