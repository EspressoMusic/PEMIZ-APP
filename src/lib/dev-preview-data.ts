/** Mock data for /dev/* previews — no database required */

import {
  defaultDaySlots,
  orderScheduleToJson,
} from "@/lib/order-schedule";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";
import { buildSlotsForRange } from "@/lib/appointment-slot-generator";
import type { StoreChatMessageDto } from "@/lib/store-chat";
import type { SellerChatThread } from "@/lib/seller-chat-threads";
import { DEFAULT_STORE_PANELS_VISIBLE } from "@/lib/store-panels-visible";

export const DEV_PREVIEW_SELLER_THREADS: SellerChatThread[] = [
  {
    customerPhone: "0501234567",
    customerName: "Yael Cohen",
    lastMessage: "Hi, do you have gluten-free cake?",
    lastAt: "2026-06-03T09:15:00.000Z",
    unreadFromCustomer: true,
  },
  {
    customerPhone: "0529876543",
    customerName: "Danny Levy",
    lastMessage: "Thanks for the delivery!",
    lastAt: "2026-06-02T18:40:00.000Z",
    unreadFromCustomer: false,
  },
];

/** Private chat messages for dev preview (by normalized phone) */
export const DEV_PREVIEW_SELLER_CHAT: StoreChatMessageDto[] = [
  {
    id: "demo-seller-1",
    channel: "SELLER",
    customerPhone: "0501234567",
    customerName: "Yael Cohen",
    authorRole: "CUSTOMER",
    body: "Hi, do you have gluten-free cake?",
    createdAt: "2026-06-03T09:10:00.000Z",
  },
  {
    id: "demo-seller-2",
    channel: "SELLER",
    customerPhone: "0501234567",
    customerName: "My Bakery (Preview)",
    authorRole: "SELLER",
    body: "Yes! We have chocolate cake and croissants — best to order a day ahead.",
    createdAt: "2026-06-03T09:12:00.000Z",
  },
  {
    id: "demo-seller-3",
    channel: "SELLER",
    customerPhone: "0529876543",
    customerName: "Danny Levy",
    authorRole: "CUSTOMER",
    body: "Thanks for the delivery!",
    createdAt: "2026-06-02T18:35:00.000Z",
  },
];

export const DEV_PREVIEW_INQUIRIES = [
  {
    id: "inq-1",
    customerName: "Yael Cohen",
    customerPhone: "050-1234567",
    subject: "Friday delivery",
    message: "Is Friday delivery available?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-2",
    customerName: "Danny Levy",
    customerPhone: "052-9876543",
    subject: "Gluten-free products",
    message: "Do you have gluten-free cakes?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-3",
    customerName: "Michal Abraham",
    customerPhone: "054-1112233",
    subject: "Event order",
    message: "Need 30 units for Thursday — can you prepare them?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-4",
    customerName: "Ori Shemesh",
    customerPhone: "053-4455667",
    subject: "Business hours",
    message: "What time can I pick up an order today?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-5",
    customerName: "Noa Gal",
    customerPhone: "058-9988776",
    subject: "Bulk discount",
    message: "Is there a discount on orders over 10 units?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-6",
    customerName: "Ron David",
    customerPhone: "050-3344556",
    subject: "Thanks for the delivery",
    message: "The order arrived perfectly, thank you so much!",
    sellerReply: "Glad to hear it! We'd love to see you again soon.",
    sellerReplyAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEV_PREVIEW_ORDERS = [
  {
    id: "ord-demo-1",
    orderNumber: 1042,
    customerName: "Barbosa",
    customerPhone: "0586122187",
    customerJoinedAt: "2025-11-12T10:00:00.000Z",
    status: "PENDING",
    statusLabel: "Pending",
    createdAt: "2026-06-04T17:20:00.000Z",
    items: [
      {
        name: "Yummy",
        quantity: 1,
        lineTotal: 100,
        imageUrl: null as string | null,
      },
      {
        name: "Demo Item",
        quantity: 1,
        lineTotal: 345,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-2",
    orderNumber: 1041,
    customerName: "Shila",
    customerPhone: "0527654321",
    status: "PENDING",
    statusLabel: "Pending",
    createdAt: "2026-06-03T09:47:00.000Z",
    items: [
      {
        name: "Demo Item",
        quantity: 1,
        lineTotal: 345,
        imageUrl: null as string | null,
      },
      {
        name: "Demo Item",
        quantity: 1,
        lineTotal: 345,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-3",
    orderNumber: 1038,
    customerName: "Yael Cohen",
    customerPhone: "050-1234567",
    status: "CONFIRMED",
    statusLabel: "Confirmed",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "Chocolate Cake",
        quantity: 1,
        lineTotal: 99,
        imageUrl: null as string | null,
      },
      {
        name: "Croissant",
        quantity: 2,
        lineTotal: 36,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-4",
    orderNumber: 1031,
    customerName: "Michal Abraham",
    customerPhone: "054-1112233",
    status: "COMPLETED",
    statusLabel: "Completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "Croissant",
        quantity: 3,
        lineTotal: 54,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-anon",
    orderNumber: 1028,
    customerName: "",
    customerPhone: "053-4445566",
    status: "COMPLETED",
    statusLabel: "Completed",
    createdAt: "2026-05-28T14:15:00.000Z",
    items: [
      {
        name: "Cheesecake",
        quantity: 1,
        lineTotal: 85,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-5",
    orderNumber: 1015,
    customerName: "Danny Levy",
    customerPhone: "052-9876543",
    status: "CANCELLED",
    statusLabel: "Cancelled",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "Sourdough Bread",
        quantity: 1,
        lineTotal: 28,
        imageUrl: null as string | null,
      },
    ],
  },
];

export const DEV_STORE_OWNER_NAME = "Yael";

/** Products for dev preview — long list for scroll testing in grid */
export const DEV_PREVIEW_PRODUCTS = [
  {
    id: "demo-p0",
    name: "Cheesecake",
    description: "Out of stock — example",
    imageUrl: null,
    price: 85,
    salePrice: null,
    stock: 0,
    isActive: true,
  },
  {
    id: "demo-p1",
    name: "Chocolate Cake",
    description: "Rich cake",
    imageUrl: null,
    price: 120,
    salePrice: 99,
    stock: 5,
    isActive: true,
  },
  {
    id: "demo-p2",
    name: "Croissant",
    description: null,
    imageUrl: null,
    price: 18,
    salePrice: null,
    stock: null,
    isActive: true,
  },
  {
    id: "demo-p3",
    name: "Almond Cookies",
    description: null,
    imageUrl: null,
    price: 32,
    salePrice: 28,
    stock: 12,
    isActive: true,
  },
  {
    id: "demo-p4",
    name: "Sourdough Bread",
    description: null,
    imageUrl: null,
    price: 28,
    salePrice: null,
    stock: 3,
    isActive: true,
  },
  {
    id: "demo-p5",
    name: "Blueberry Muffin",
    description: null,
    imageUrl: null,
    price: 14,
    salePrice: null,
    stock: null,
    isActive: true,
  },
  {
    id: "demo-p6",
    name: "Lemon Tart",
    description: null,
    imageUrl: null,
    price: 45,
    salePrice: 39,
    stock: 8,
    isActive: false,
  },
  {
    id: "demo-p7",
    name: "Rugelach",
    description: null,
    imageUrl: null,
    price: 22,
    salePrice: null,
    stock: 10,
    isActive: false,
  },
  {
    id: "demo-p8",
    name: "Challah",
    description: null,
    imageUrl: null,
    price: 16,
    salePrice: null,
    stock: null,
    isActive: false,
  },
];

function devPreviewDealProduct(id: string) {
  const product = DEV_PREVIEW_PRODUCTS.find((item) => item.id === id);
  if (!product) {
    throw new Error(`Missing dev preview product: ${id}`);
  }
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    isActive: product.isActive,
    imageUrl: product.imageUrl,
  };
}

/** Deals for dev seller preview — existing deals list testing */
export const DEV_PREVIEW_DEALS = [
  {
    id: "demo-deal-1",
    name: "Couple's Morning Deal",
    imageUrl: null,
    dealPrice: 28,
    validUntil: "2026-07-15T23:59:59.000Z",
    isActive: true,
    maxRedemptionsPerCustomer: 1,
    products: [
      devPreviewDealProduct("demo-p2"),
      devPreviewDealProduct("demo-p5"),
    ],
  },
  {
    id: "demo-deal-2",
    name: "Family Dessert Pack",
    imageUrl: null,
    dealPrice: 125,
    validUntil: "2026-08-01T23:59:59.000Z",
    isActive: true,
    maxRedemptionsPerCustomer: 0,
    products: [
      devPreviewDealProduct("demo-p1"),
      devPreviewDealProduct("demo-p3"),
    ],
  },
  {
    id: "demo-deal-3",
    name: "Bread and Pastry",
    imageUrl: null,
    dealPrice: 38,
    validUntil: "2026-05-20T23:59:59.000Z",
    isActive: false,
    maxRedemptionsPerCustomer: 3,
    products: [
      devPreviewDealProduct("demo-p4"),
      devPreviewDealProduct("demo-p5"),
    ],
  },
];

export function devPreviewCustomerProducts() {
  return DEV_PREVIEW_PRODUCTS.filter((product) => product.isActive).map(
    ({ isActive: _isActive, ...product }) => product
  );
}

export const DEV_STORE_BUSINESS = {
  slug: "demo-store",
  name: "My Bakery (Preview)",
  description: null,
  type: "STORE" as const,
  storeDecoration: "flowers",
  sellerContactPhone: "050-1234567",
  storePanelsVisible: { ...DEFAULT_STORE_PANELS_VISIBLE, coupons: true },
  products: devPreviewCustomerProducts(),
  deals: [
    {
      id: "deal-active",
      name: "Active Deal (Demo)",
      imageUrl: null,
      dealPrice: 110,
      validUntil: "2027-12-31T23:59:59.000Z",
      createdAt: "2026-01-01T10:00:00.000Z",
      maxRedemptionsPerCustomer: 1,
      products: [
        {
          id: "1",
          name: "Chocolate Cake",
          imageUrl: null,
          price: 120,
          salePrice: 99,
          stock: 5,
          quantity: 1,
        },
        {
          id: "2",
          name: "Croissant",
          imageUrl: null,
          price: 18,
          salePrice: null,
          stock: null,
          quantity: 2,
        },
      ],
    },
    {
      id: "deal-oos",
      name: "Out of Stock Deal (Demo)",
      imageUrl: null,
      dealPrice: 42,
      validUntil: "2027-12-31T23:59:59.000Z",
      createdAt: "2026-01-02T10:00:00.000Z",
      maxRedemptionsPerCustomer: 0,
      products: [
        {
          id: "2",
          name: "Croissant",
          imageUrl: null,
          price: 18,
          salePrice: null,
          stock: null,
          quantity: 1,
        },
        {
          id: "demo-p4",
          name: "Sourdough Bread",
          imageUrl: null,
          price: 28,
          salePrice: null,
          stock: 0,
          quantity: 1,
        },
      ],
    },
  ],
  slots: [] as {
    id: string;
    startAt: string;
    endAt: string;
    maxBookings: number;
    appointments: unknown[];
  }[],
  faqItems: [
    {
      id: "faq-1",
      question: "How long does delivery take?",
      answer: "45–90 minutes depending on area and demand.",
    },
    {
      id: "faq-2",
      question: "Do you have gluten-free products?",
      answer: "Yes — chocolate cake and croissants. Best to order a day ahead.",
    },
  ],
  storeUrl: "http://localhost:3000/dev/customer",
  storeBroadcast: "This week's deal: 10% off all products until Friday!",
  storeBroadcastAt: "2026-06-01T12:00:00.000Z",
  storeBroadcastHistory: [
    {
      message: "This week's deal: 10% off all products until Friday!",
      sentAt: "2026-06-01T12:00:00.000Z",
    },
    {
      message: "Grand reopening — a gift for every customer who orders!",
      sentAt: "2026-05-20T09:30:00.000Z",
    },
    {
      message: "Happy holiday! Pre-order holiday cakes now.",
      sentAt: "2026-05-10T16:00:00.000Z",
    },
  ],
  storeTheme: "turquoise",
  storeLocale: "he" as const,
  storePolicy:
    "Deliveries within the city Sun–Thu. Order by 6:00 PM for next-morning delivery.",
  storeTerms:
    "Placing an order constitutes agreement to the terms of use. Cancel up to 24 hours before pickup time.",
  demoOrders: {
    active: [],
    history: [
      {
        id: "demo-order-history",
        placedAt: "2026-05-28T14:15:00.000Z",
        statusLabel: "Completed",
        orderNumber: 1028,
        lines: [
          {
            name: "Chocolate Cake",
            imageUrl: null,
            qty: 1,
            lineTotal: 99,
          },
        ],
        total: 99,
      },
    ],
  },
};

export const DEV_APPOINTMENTS_BUSINESS = {
  slug: "demo-appointments",
  name: "Beauty Studio (Preview)",
  description: "Appointments for facials, hair styling, and manicures.",
  type: "APPOINTMENTS" as const,
  sellerContactPhone: "050-7654321",
  products: [
    {
      id: "svc-1",
      name: "Facial Treatment",
      description: "Deep cleanse and hydration",
      imageUrl: null,
      price: 180,
      salePrice: null,
      stock: null,
      serviceDurationMinutes: 90,
    },
    {
      id: "svc-2",
      name: "Men's Haircut",
      description: null,
      imageUrl: null,
      price: 90,
      salePrice: 75,
      stock: null,
      serviceDurationMinutes: 45,
    },
  ],
  deals: [],
  slots: [] as {
    id: string;
    startAt: string;
    endAt: string;
    maxBookings: number;
    appointments: unknown[];
  }[],
  faqItems: [
    {
      id: "faq-appt-1",
      question: "How do I cancel an appointment?",
      answer: "Up to 24 hours before the appointment — via chat or phone.",
    },
    {
      id: "faq-appt-2",
      question: "Is parking available?",
      answer: "Yes, free parking for customers in the adjacent lot.",
    },
  ],
  storeUrl: "http://localhost:3000/dev/customer-appointments",
  storeBroadcast: "Convenient Sunday appointments — last spots available!",
  storeBroadcastAt: "2026-06-01T10:00:00.000Z",
  storeBroadcastHistory: [
    {
      message: "Convenient Sunday appointments — last spots available!",
      sentAt: "2026-06-01T10:00:00.000Z",
    },
  ],
  storeTheme: "turquoise",
  storeLocale: "he" as const,
  storePolicy: "Appointments Sun–Thu. Arriving more than 10 minutes late may cancel the appointment.",
  storeTerms: "Cancel an appointment up to 24 hours before the scheduled time at no charge.",
  appointmentSlotGapMinutes: 0,
  appointmentSlotDurationMinutes: 60,
  appointmentBookingStart: "09:00",
  appointmentBookingEnd: "18:00",
  appointmentBookingByDay: false,
  orderScheduleEnabled: true,
  orderSchedule: orderScheduleToJson(
    defaultDaySlots().map((slot) => ({
      ...slot,
      open: slot.day <= 4,
    }))
  ),
};

export const DEV_APPOINTMENTS_SELLER_BASE = "/dev/seller-appointments";

export const DEV_APPOINTMENTS_SELLER_SHELL = {
  businessType: "APPOINTMENTS" as const,
  basePath: DEV_APPOINTMENTS_SELLER_BASE,
  storeLocale: DEV_APPOINTMENTS_BUSINESS.storeLocale,
  storeTheme: DEV_APPOINTMENTS_BUSINESS.storeTheme,
  orderScheduleEnabled: DEV_APPOINTMENTS_BUSINESS.orderScheduleEnabled ?? false,
  orderSchedule: DEV_APPOINTMENTS_BUSINESS.orderSchedule ?? null,
  initialActiveServiceCount: DEV_APPOINTMENTS_BUSINESS.products.length,
};

export const DEV_APPOINTMENTS_OWNER_NAME = "Mia";

export const DEV_APPOINTMENTS_PREVIEW_INQUIRIES = [
  {
    id: "appt-inq-1",
    customerName: "Yael Cohen",
    customerPhone: "050-1234567",
    subject: "Reschedule appointment",
    message: "Can I move my appointment to Thursday morning?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "appt-inq-2",
    customerName: "Danny Levy",
    customerPhone: "052-9876543",
    subject: "Cancel appointment",
    message: "I need to cancel tomorrow's appointment — is that possible?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "appt-inq-3",
    customerName: "Ron Stern",
    customerPhone: "054-1112233",
    subject: "Service question",
    message: "How long does a full color treatment take?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEV_APPOINTMENTS_PREVIEW_SELLER_THREADS: SellerChatThread[] = [
  {
    customerPhone: "0501234567",
    customerName: "Yael Cohen",
    lastMessage: "Any openings Sunday morning?",
    lastAt: "2026-06-03T09:15:00.000Z",
    unreadFromCustomer: true,
  },
  {
    customerPhone: "0534445566",
    customerName: "Noa Barak",
    lastMessage: "Thanks, I'll confirm the time",
    lastAt: "2026-06-02T16:20:00.000Z",
    unreadFromCustomer: false,
  },
];

function devAppointmentSlotIso(daysAhead: number, hour: number, minute = 0) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + daysAhead);
  start.setHours(hour, minute, 0, 0);
  return start.toISOString();
}

function devAppointmentSlotEnd(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

/** Demo appointments — full slots per business settings (9:00–18:00, 15 min gap) */
export function getDevAppointmentsBusiness() {
  const baseConfig = calendarConfigFromBusiness(DEV_APPOINTMENTS_BUSINESS);
  const config = {
    ...baseConfig,
    bookingByDay: DEV_APPOINTMENTS_BUSINESS.appointmentBookingByDay ?? false,
  };

  const generated = buildSlotsForRange(
    config,
    DEV_APPOINTMENTS_BUSINESS.orderScheduleEnabled ?? false,
    DEV_APPOINTMENTS_BUSINESS.orderSchedule ?? null,
    4
  );

  const slots = generated.map((slot, index) => ({
    id: `slot-${index + 1}`,
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
    maxBookings: slot.maxBookings,
    appointments: [] as { id: string }[],
  }));

  // Demo: some slots are fully booked
  const markFull = (startHour: number, daysAhead: number) => {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() + daysAhead);
    target.setHours(startHour, 0, 0, 0);
    const match = slots.find(
      (s) => Math.abs(new Date(s.startAt).getTime() - target.getTime()) < 60_000
    );
    if (match) {
      match.maxBookings = 1;
      match.appointments = [{ id: `appt-full-${startHour}-${daysAhead}` }];
    }
  };

  const tomorrowSlot = slots.find((s) => {
    const d = new Date(s.startAt);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate() &&
      d.getHours() === 10
    );
  });
  if (tomorrowSlot) {
    tomorrowSlot.maxBookings = 2;
    tomorrowSlot.appointments = [{ id: "appt-1" }];
  }

  markFull(14, 1);
  markFull(9, 3);
  markFull(15, 5);

  return {
    ...DEV_APPOINTMENTS_BUSINESS,
    slots,
  };
}

export function getDevPreviewAppointmentsSeller() {
  const biz = getDevAppointmentsBusiness();
  const partial = biz.slots.find((s) => s.appointments.some((a) => a.id === "appt-1"));
  const fullSlots = biz.slots.filter(
    (s) =>
      s.appointments.length > 0 &&
      s.maxBookings <= s.appointments.length &&
      !s.appointments.some((a) => a.id === "appt-1")
  );
  const openSlots = biz.slots.filter((s) => s.appointments.length === 0);
  const slotA = partial ?? openSlots[0];
  const slotB = openSlots.find((s) => s.id !== slotA?.id) ?? openSlots[1];
  const slotFull1 = fullSlots[0];
  const slotFull2 = fullSlots[1];
  if (!slotA || !slotB || !slotFull1 || !slotFull2) {
    return [];
  }
  const pastSlot = devAppointmentSlotIso(-3, 10);
  return [
    {
      id: "appt-seller-1",
      customerName: "Yael Cohen",
      customerPhone: "0501234567",
      status: "CONFIRMED",
      notes: "Service: Haircut\nWants a short cut",
      slot: {
        startAt: slotA.startAt,
        endAt: slotA.endAt,
      },
    },
    {
      id: "appt-seller-2",
      customerName: "Danny Levy",
      customerPhone: "0529876543",
      status: "CONFIRMED",
      slot: {
        startAt: slotB.startAt,
        endAt: slotB.endAt,
      },
    },
    {
      id: "appt-f1",
      customerName: "Ron Stern",
      customerPhone: "0541112222",
      status: "CONFIRMED",
      slot: {
        startAt: slotFull1.startAt,
        endAt: slotFull1.endAt,
      },
    },
    {
      id: "appt-f2",
      customerName: "Noa Barak",
      customerPhone: "0534445566",
      status: "CONFIRMED",
      slot: {
        startAt: slotFull1.startAt,
        endAt: slotFull1.endAt,
      },
    },
    {
      id: "appt-f3",
      customerName: "Itai Mizrahi",
      customerPhone: "0587778899",
      status: "CONFIRMED",
      slot: {
        startAt: slotFull2.startAt,
        endAt: slotFull2.endAt,
      },
    },
    {
      id: "appt-history-1",
      customerName: "Michal Abraham",
      customerPhone: "0523334455",
      status: "CONFIRMED",
      slot: {
        startAt: pastSlot,
        endAt: devAppointmentSlotEnd(pastSlot, 60),
      },
    },
  ];
}

export function getDevSellerHomeCalendarPreview() {
  const biz = getDevAppointmentsBusiness();
  return {
    slots: biz.slots,
    appointments: getDevPreviewAppointmentsSeller(),
    bookingByDay: DEV_APPOINTMENTS_BUSINESS.appointmentBookingByDay ?? false,
    orderScheduleEnabled: DEV_APPOINTMENTS_BUSINESS.orderScheduleEnabled ?? false,
    orderSchedule: DEV_APPOINTMENTS_BUSINESS.orderSchedule ?? null,
    /** Frozen at request time so SSR and hydration use the same "now". */
    referenceNowMs: Date.now(),
  };
}

export function getDevPreviewCustomerOrdersFromAppointments() {
  return getDevPreviewAppointmentsSeller().map((appt) => ({
    id: appt.id,
    customerName: appt.customerName,
    customerPhone: appt.customerPhone,
    status: appt.status,
    statusLabel: appt.status,
    createdAt: appt.slot.startAt,
    items: [] as {
      name: string;
      quantity: number;
      lineTotal: number;
      imageUrl: string | null;
    }[],
  }));
}

export const DEV_RENTAL_BUSINESS = {
  slug: "demo-rental",
  name: "Sea Villa (Preview)",
  description: "Villa rental by full day, half day, or weekend — subject to availability.",
  type: "RENTAL" as const,
  sellerContactPhone: "052-1112233",
  products: [
    {
      id: "rent-1",
      name: "Full Villa — Full Day",
      description: "Up to 8 guests, pool and fully equipped kitchen",
      imageUrl: null,
      price: 1200,
      salePrice: null,
      stock: null,
      serviceDurationMinutes: null,
    },
    {
      id: "rent-2",
      name: "Half Day — Morning",
      description: "Check-in from 08:00 until 14:00",
      imageUrl: null,
      price: 650,
      salePrice: 590,
      stock: null,
      serviceDurationMinutes: null,
    },
  ],
  deals: [],
  slots: [] as {
    id: string;
    startAt: string;
    endAt: string;
    maxBookings: number;
    appointments: unknown[];
  }[],
  faqItems: [
    {
      id: "faq-rent-1",
      question: "How do I cancel a booking?",
      answer: "Up to 48 hours before the rental start — no charge.",
    },
    {
      id: "faq-rent-2",
      question: "What is included in the price?",
      answer: "Water, electricity, linens, and towels — breakfast not included.",
    },
  ],
  storeUrl: "http://localhost:3000/dev/customer-rental",
  storeBroadcast: "Weekend available this Friday — book now!",
  storeBroadcastAt: "2026-06-01T10:00:00.000Z",
  storeBroadcastHistory: [
    {
      message: "Weekend available this Friday — book now!",
      sentAt: "2026-06-01T10:00:00.000Z",
    },
  ],
  storeTheme: "turquoise",
  storeLocale: "he" as const,
  storePolicy: "Rentals Sun–Fri. Check-in from 3:00 PM, check-out by 11:00 AM.",
  storeTerms: "Cancel up to 48 hours before the rental start.",
  appointmentSlotGapMinutes: 0,
  appointmentSlotDurationMinutes: 1440,
  appointmentBookingStart: "00:00",
  appointmentBookingEnd: "23:59",
  appointmentBookingByDay: true,
  orderScheduleEnabled: true,
  orderSchedule: orderScheduleToJson(
    defaultDaySlots().map((slot) => ({
      ...slot,
      open: slot.day <= 5,
    }))
  ),
};

export const DEV_RENTAL_SELLER_BASE = "/dev/seller-rental";

export const DEV_RENTAL_SELLER_SHELL = {
  businessType: "RENTAL" as const,
  basePath: DEV_RENTAL_SELLER_BASE,
  storeLocale: DEV_RENTAL_BUSINESS.storeLocale,
  storeTheme: DEV_RENTAL_BUSINESS.storeTheme,
  orderScheduleEnabled: DEV_RENTAL_BUSINESS.orderScheduleEnabled ?? false,
  orderSchedule: DEV_RENTAL_BUSINESS.orderSchedule ?? null,
};

export const DEV_RENTAL_OWNER_NAME = "Dan";

export const DEV_RENTAL_PREVIEW_INQUIRIES = [
  {
    id: "rent-inq-1",
    customerName: "Yael Cohen",
    customerPhone: "050-1234567",
    subject: "Weekend rental",
    message: "Is a villa available this coming weekend for 6 people?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "rent-inq-2",
    customerName: "Danny Levy",
    customerPhone: "052-9876543",
    subject: "Half day",
    message: "Can I rent for just a half day on Thursday?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEV_RENTAL_PREVIEW_SELLER_THREADS: SellerChatThread[] = [
  {
    customerPhone: "0501234567",
    customerName: "Yael Cohen",
    lastMessage: "Any availability for 3 nights in August?",
    lastAt: "2026-06-03T09:15:00.000Z",
    unreadFromCustomer: true,
  },
  {
    customerPhone: "0534445566",
    customerName: "Noa Barak",
    lastMessage: "Great, we'll confirm the dates",
    lastAt: "2026-06-02T16:20:00.000Z",
    unreadFromCustomer: false,
  },
];

export function getDevRentalBusiness() {
  const day1 = devAppointmentSlotIso(2, 15);
  const day1b = devAppointmentSlotIso(4, 15);
  const day2 = devAppointmentSlotIso(7, 15);
  const dayFull = devAppointmentSlotIso(10, 15);
  const dayFull2 = devAppointmentSlotIso(14, 15);

  return {
    ...DEV_RENTAL_BUSINESS,
    slots: [
      {
        id: "rent-slot-1",
        startAt: day1,
        endAt: devAppointmentSlotEnd(day1, 1440),
        maxBookings: 1,
        appointments: [{ id: "rent-appt-1" }],
      },
      {
        id: "rent-slot-2",
        startAt: day1b,
        endAt: devAppointmentSlotEnd(day1b, 1440),
        maxBookings: 1,
        appointments: [],
      },
      {
        id: "rent-slot-3",
        startAt: day2,
        endAt: devAppointmentSlotEnd(day2, 1440),
        maxBookings: 1,
        appointments: [],
      },
      {
        id: "rent-slot-full-1",
        startAt: dayFull,
        endAt: devAppointmentSlotEnd(dayFull, 1440),
        maxBookings: 1,
        appointments: [{ id: "rent-appt-f1" }],
      },
      {
        id: "rent-slot-full-2",
        startAt: dayFull2,
        endAt: devAppointmentSlotEnd(dayFull2, 1440),
        maxBookings: 1,
        appointments: [{ id: "rent-appt-f2" }],
      },
    ],
  };
}

function devRentalStayRange(dayOffset: number, nights: number) {
  const startAt = devAppointmentSlotIso(dayOffset, 15);
  const endAt = devAppointmentSlotIso(dayOffset + nights, 11);
  return { startAt, endAt };
}

export function getDevPreviewRentalSeller() {
  const biz = getDevRentalBusiness();
  const slotA = biz.slots[0];
  const slotB = biz.slots[1];
  const slotFull1 = biz.slots[3];
  const slotFull2 = biz.slots[4];
  if (!slotA || !slotB || !slotFull1 || !slotFull2) {
    return [];
  }
  const stayA = devRentalStayRange(2, 3);
  const stayB = devRentalStayRange(4, 2);
  const stayFull1 = devRentalStayRange(10, 2);
  const stayFull2 = devRentalStayRange(14, 4);
  const pastStay = devRentalStayRange(-5, 2);
  return [
    {
      id: "rent-seller-1",
      customerName: "Yael Cohen",
      customerPhone: "0501234567",
      status: "CONFIRMED",
      notes: "Service: Full Villa — Full Day\nRental: 3 nights",
      slot: stayA,
    },
    {
      id: "rent-seller-2",
      customerName: "Danny Levy",
      customerPhone: "0529876543",
      status: "CONFIRMED",
      notes: "Service: Half Day — Morning\nRental: 2 nights",
      slot: stayB,
    },
    {
      id: "rent-appt-f1",
      customerName: "Ron Stern",
      customerPhone: "0541112222",
      status: "CONFIRMED",
      notes: "Service: Full Villa\nRental: 2 nights",
      slot: stayFull1,
    },
    {
      id: "rent-appt-f2",
      customerName: "Itai Mizrahi",
      customerPhone: "0587778899",
      status: "CONFIRMED",
      notes: "Service: Full Villa\nRental: 4 nights",
      slot: stayFull2,
    },
    {
      id: "rent-history-1",
      customerName: "Michal Abraham",
      customerPhone: "0523334455",
      status: "CONFIRMED",
      notes: "Service: Full Villa\nRental: 2 nights",
      slot: pastStay,
    },
  ];
}

export function getDevSellerHomeRentalCalendarPreview() {
  const biz = getDevRentalBusiness();
  return {
    slots: biz.slots,
    appointments: getDevPreviewRentalSeller(),
    bookingByDay: DEV_RENTAL_BUSINESS.appointmentBookingByDay ?? false,
    orderScheduleEnabled: DEV_RENTAL_BUSINESS.orderScheduleEnabled ?? false,
    orderSchedule: DEV_RENTAL_BUSINESS.orderSchedule ?? null,
    referenceNowMs: Date.now(),
  };
}

export function getDevPreviewCustomerOrdersFromRental() {
  return getDevPreviewRentalSeller().map((appt) => ({
    id: appt.id,
    customerName: appt.customerName,
    customerPhone: appt.customerPhone,
    status: appt.status,
    statusLabel: appt.status,
    createdAt: appt.slot.startAt,
    items: [] as {
      name: string;
      quantity: number;
      lineTotal: number;
      imageUrl: string | null;
    }[],
  }));
}

const DEV_MASTER_NOW = Date.now();
const daysAgo = (days: number) =>
  new Date(DEV_MASTER_NOW - days * 24 * 60 * 60 * 1000).toISOString();

/** Preview data for /dev/master — mirrors the shape /api/admin/businesses returns. */
export const DEV_MASTER_BUSINESSES = [
  {
    id: "dev-biz-1",
    name: "המאפייה של יעל",
    slug: "yael-bakery",
    type: "STORE",
    description: "עוגות ומאפים ביתיים, הזמנה מראש",
    isActive: true,
    approvedAt: daysAgo(40),
    createdAt: daysAgo(42),
    subscriptionActiveAt: daysAgo(10),
    subscriptionPlan: "premium-monthly",
    termsAcceptedAt: daysAgo(42),
    publicUrl: "https://peymiz.com/b/yael-bakery",
    owner: {
      id: "dev-owner-1",
      email: "yael@example.com",
      name: "יעל כהן",
      phone: "0501234567",
      emailVerified: true,
      createdAt: daysAgo(42),
    },
    _count: { orders: 128, appointments: 0, inquiries: 6, products: 14, slots: 0 },
  },
  {
    id: "dev-biz-2",
    name: "מיה — עיצוב שיער",
    slug: "mia-hair",
    type: "APPOINTMENTS",
    description: null,
    isActive: true,
    approvedAt: daysAgo(5),
    createdAt: daysAgo(6),
    subscriptionActiveAt: null,
    subscriptionPlan: null,
    termsAcceptedAt: daysAgo(6),
    publicUrl: "https://peymiz.com/b/mia-hair",
    owner: {
      id: "dev-owner-2",
      email: "mia@example.com",
      name: "מיה לוי",
      phone: null,
      emailVerified: true,
      createdAt: daysAgo(6),
    },
    _count: { orders: 0, appointments: 34, inquiries: 2, products: 5, slots: 12 },
  },
  {
    id: "dev-biz-3",
    name: "🧪 Guest Test Store",
    slug: "guest-test-store-9",
    type: "STORE",
    description: "Sandbox payment test store — safe to delete.",
    isActive: false,
    approvedAt: null,
    createdAt: daysAgo(1),
    subscriptionActiveAt: null,
    subscriptionPlan: null,
    termsAcceptedAt: daysAgo(1),
    publicUrl: "https://peymiz.com/b/guest-test-store-9",
    owner: {
      id: "dev-owner-3",
      email: "guest-123@preview.peymiz.test",
      name: "Guest Tester",
      phone: null,
      emailVerified: true,
      createdAt: daysAgo(1),
    },
    _count: { orders: 0, appointments: 0, inquiries: 0, products: 0, slots: 0 },
  },
];

export const DEV_MASTER_PENDING_OWNERS = [
  {
    id: "dev-pending-1",
    email: "started-signup@example.com",
    name: "דני מזרחי",
    emailVerified: false,
    createdAt: daysAgo(2),
  },
];
