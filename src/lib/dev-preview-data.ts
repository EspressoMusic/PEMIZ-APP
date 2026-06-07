/** Mock data for /dev/* previews — no database required */

import {
  defaultDaySlots,
  orderScheduleToJson,
} from "@/lib/order-schedule";
import type { StoreChatMessageDto } from "@/lib/store-chat";
import type { SellerChatThread } from "@/lib/seller-chat-threads";

export const DEV_PREVIEW_SELLER_THREADS: SellerChatThread[] = [
  {
    customerPhone: "0501234567",
    customerName: "יעל כהן",
    lastMessage: "שלום, יש עוגה ללא גלוטן?",
    lastAt: "2026-06-03T09:15:00.000Z",
    unreadFromCustomer: true,
  },
  {
    customerPhone: "0529876543",
    customerName: "דני לוי",
    lastMessage: "תודה על המשלוח!",
    lastAt: "2026-06-02T18:40:00.000Z",
    unreadFromCustomer: false,
  },
];

/** הודעות לצ'אט פרטי בתצוגת dev (לפי טלפון מנורמל) */
export const DEV_PREVIEW_SELLER_CHAT: StoreChatMessageDto[] = [
  {
    id: "demo-seller-1",
    channel: "SELLER",
    customerPhone: "0501234567",
    customerName: "יעל כהן",
    authorRole: "CUSTOMER",
    body: "שלום, יש עוגה ללא גלוטן?",
    createdAt: "2026-06-03T09:10:00.000Z",
  },
  {
    id: "demo-seller-2",
    channel: "SELLER",
    customerPhone: "0501234567",
    customerName: "המאפייה שלי (תצוגה)",
    authorRole: "SELLER",
    body: "כן! יש עוגת שוקולד וקרואסון — מומלץ להזמין יום מראש.",
    createdAt: "2026-06-03T09:12:00.000Z",
  },
  {
    id: "demo-seller-3",
    channel: "SELLER",
    customerPhone: "0529876543",
    customerName: "דני לוי",
    authorRole: "CUSTOMER",
    body: "תודה על המשלוח!",
    createdAt: "2026-06-02T18:35:00.000Z",
  },
];

export const DEV_PREVIEW_INQUIRIES = [
  {
    id: "inq-1",
    customerName: "יעל כהן",
    customerPhone: "050-1234567",
    subject: "משלוח ביום שישי",
    message: "יש אפשרות למשלוח ביום שישי?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-2",
    customerName: "דני לוי",
    customerPhone: "052-9876543",
    subject: "מוצרים ללא גלוטן",
    message: "האם יש עוגות ללא גלוטן?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-3",
    customerName: "מיכל אברהם",
    customerPhone: "054-1112233",
    subject: "הזמנה לאירוע",
    message: "צריך 30 יחידות ליום חמישי — אפשר להכין?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-4",
    customerName: "אורי שמש",
    customerPhone: "053-4455667",
    subject: "שעות פעילות",
    message: "עד איזה שעה אפשר לאסוף הזמנה היום?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-5",
    customerName: "נועה גל",
    customerPhone: "058-9988776",
    subject: "הנחה לכמות",
    message: "יש הנחה על הזמנה מעל 10 יחידות?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-6",
    customerName: "רון דוד",
    customerPhone: "050-3344556",
    subject: "תודה על המשלוח",
    message: "ההזמנה הגיעה מעולה, תודה רבה!",
    sellerReply: "שמחים לשמוע! נשמח לראותך שוב בקרוב.",
    sellerReplyAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEV_PREVIEW_ORDERS = [
  {
    id: "ord-demo-1",
    customerName: "ברבוסה",
    customerPhone: "0586122187",
    customerJoinedAt: "2025-11-12T10:00:00.000Z",
    status: "PENDING",
    statusLabel: "ממתין",
    createdAt: "2026-06-04T17:20:00.000Z",
    items: [
      {
        name: "יאמי",
        quantity: 1,
        lineTotal: 100,
        imageUrl: null as string | null,
      },
      {
        name: "כגעג",
        quantity: 1,
        lineTotal: 345,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-2",
    customerName: "שילה",
    customerPhone: "0527654321",
    status: "PENDING",
    statusLabel: "ממתין",
    createdAt: "2026-06-03T09:47:00.000Z",
    items: [
      {
        name: "כגעג",
        quantity: 1,
        lineTotal: 345,
        imageUrl: null as string | null,
      },
      {
        name: "כגעג",
        quantity: 1,
        lineTotal: 345,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-3",
    customerName: "יעל כהן",
    customerPhone: "050-1234567",
    status: "CONFIRMED",
    statusLabel: "אושר",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "עוגת שוקולד",
        quantity: 1,
        lineTotal: 99,
        imageUrl: null as string | null,
      },
      {
        name: "קרואסון",
        quantity: 2,
        lineTotal: 36,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-4",
    customerName: "מיכל אברהם",
    customerPhone: "054-1112233",
    status: "COMPLETED",
    statusLabel: "הושלם",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "קרואסון",
        quantity: 3,
        lineTotal: 54,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-anon",
    customerName: "",
    customerPhone: "053-4445566",
    status: "COMPLETED",
    statusLabel: "הושלם",
    createdAt: "2026-05-28T14:15:00.000Z",
    items: [
      {
        name: "עוגת גבינה",
        quantity: 1,
        lineTotal: 85,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-demo-5",
    customerName: "דני לוי",
    customerPhone: "052-9876543",
    status: "CANCELLED",
    statusLabel: "בוטל",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "לחם מחמצת",
        quantity: 1,
        lineTotal: 28,
        imageUrl: null as string | null,
      },
    ],
  },
];

export const DEV_STORE_OWNER_NAME = "יעל";

/** מוצרים לתצוגת dev — רשימה ארוכה לבדיקת גלילה בריבוע */
export const DEV_PREVIEW_PRODUCTS = [
  {
    id: "demo-p1",
    name: "עוגת שוקולד",
    description: "עוגה עשירה",
    imageUrl: null,
    price: 120,
    salePrice: 99,
    stock: 5,
    isActive: true,
  },
  {
    id: "demo-p2",
    name: "קרואסון",
    description: null,
    imageUrl: null,
    price: 18,
    salePrice: null,
    stock: null,
    isActive: true,
  },
  {
    id: "demo-p3",
    name: "עוגיות שקדים",
    description: null,
    imageUrl: null,
    price: 32,
    salePrice: 28,
    stock: 12,
    isActive: true,
  },
  {
    id: "demo-p4",
    name: "לחם מחמצת",
    description: null,
    imageUrl: null,
    price: 28,
    salePrice: null,
    stock: 3,
    isActive: true,
  },
  {
    id: "demo-p5",
    name: "מאפין אוכמניות",
    description: null,
    imageUrl: null,
    price: 14,
    salePrice: null,
    stock: null,
    isActive: true,
  },
  {
    id: "demo-p6",
    name: "טארט לימון",
    description: null,
    imageUrl: null,
    price: 45,
    salePrice: 39,
    stock: 8,
    isActive: false,
  },
  {
    id: "demo-p7",
    name: "רוגלך",
    description: null,
    imageUrl: null,
    price: 22,
    salePrice: null,
    stock: 10,
    isActive: false,
  },
  {
    id: "demo-p8",
    name: "בצלווא",
    description: null,
    imageUrl: null,
    price: 16,
    salePrice: null,
    stock: null,
    isActive: false,
  },
];

export function devPreviewCustomerProducts() {
  return DEV_PREVIEW_PRODUCTS.filter((product) => product.isActive).map(
    ({ isActive: _isActive, ...product }) => product
  );
}

export const DEV_STORE_BUSINESS = {
  slug: "demo-store",
  name: "המאפייה שלי (תצוגה)",
  description: null,
  type: "STORE" as const,
  products: devPreviewCustomerProducts(),
  deals: [
    {
      id: "deal-active",
      name: "מבצע פעיל (דמו)",
      dealPrice: 110,
      validUntil: "2027-12-31T23:59:59.000Z",
      products: [
        {
          id: "1",
          name: "עוגת שוקולד",
          imageUrl: null,
          price: 120,
          salePrice: 99,
          stock: 5,
          quantity: 1,
        },
        {
          id: "2",
          name: "קרואסון",
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
      name: "מבצע אזל מהמלאי (דמו)",
      dealPrice: 42,
      validUntil: "2027-12-31T23:59:59.000Z",
      products: [
        {
          id: "2",
          name: "קרואסון",
          imageUrl: null,
          price: 18,
          salePrice: null,
          stock: null,
          quantity: 1,
        },
        {
          id: "demo-p4",
          name: "לחם מחמצת",
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
      question: "כמה זמן לוקח משלוח?",
      answer: "45–90 דקות לפי אזור ועומס.",
    },
    {
      id: "faq-2",
      question: "האם יש מוצרים ללא גלוטן?",
      answer: "כן — עוגת שוקולד וקרואסון. מומלץ להזמין יום מראש.",
    },
  ],
  storeUrl: "http://localhost:3000/dev/customer",
  storeBroadcast: "מבצע השבוע: 10% הנחה על כל המוצרים עד יום שישי!",
  storeBroadcastAt: "2026-06-01T12:00:00.000Z",
  storeBroadcastHistory: [
    {
      message: "מבצע השבוע: 10% הנחה על כל המוצרים עד יום שישי!",
      sentAt: "2026-06-01T12:00:00.000Z",
    },
    {
      message: "פתיחה מחודשת — מגיעים עם מתנה לכל מזמין!",
      sentAt: "2026-05-20T09:30:00.000Z",
    },
    {
      message: "חג שמח! הזמינו מראש עוגות לחג.",
      sentAt: "2026-05-10T16:00:00.000Z",
    },
  ],
  storeTheme: "calm",
  storeLocale: "he" as const,
  storePolicy:
    "משלוחים בתוך העיר בימים א׳–ה׳. הזמנה עד 18:00 למחרת בבוקר.",
  storeTerms:
    "ההזמנה מהווה הסכמה לתנאי השימוש. ביטול עד 24 שעות לפני מועד האיסוף.",
  demoOrders: {
    active: [],
    history: [
      {
        id: "demo-order-history",
        placedAt: "2026-05-28T14:15:00.000Z",
        statusLabel: "הושלמה",
        lines: [
          {
            name: "עוגת שוקולד",
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
  name: "סטודיו יופי (תצוגה)",
  description: "תורים לטיפולי פנים, עיצוב שיער ומניקור.",
  type: "APPOINTMENTS" as const,
  products: [
    {
      id: "svc-1",
      name: "טיפול פנים",
      description: "ניקוי עמוק ולחות",
      imageUrl: null,
      price: 180,
      salePrice: null,
      stock: null,
      serviceDurationMinutes: 90,
    },
    {
      id: "svc-2",
      name: "תספורת גברים",
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
      question: "איך מבטלים תור?",
      answer: "עד 24 שעות לפני המועד — דרך צ'אט או טלפון.",
    },
    {
      id: "faq-appt-2",
      question: "האם יש חניה?",
      answer: "כן, חניה חינם ללקוחות במגרש הסמוך.",
    },
  ],
  storeUrl: "http://localhost:3000/dev/customer-appointments",
  storeBroadcast: "תור נוח ביום ראשון — מקומות אחרונים!",
  storeBroadcastAt: "2026-06-01T10:00:00.000Z",
  storeBroadcastHistory: [
    {
      message: "תור נוח ביום ראשון — מקומות אחרונים!",
      sentAt: "2026-06-01T10:00:00.000Z",
    },
  ],
  storeTheme: "calm",
  storeLocale: "he" as const,
  storePolicy: "תורים בימים א׳–ה׳. איחור מעל 10 דקות עלול לבטל את התור.",
  storeTerms: "ביטול תור עד 24 שעות לפני המועד ללא חיוב.",
  appointmentSlotGapMinutes: 15,
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
};

export const DEV_APPOINTMENTS_OWNER_NAME = "מיה";

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

/** תורים לדמו — תאריכים יחסיים להיום כדי שהיומן תמיד יציג ימים פנויים/תפוסים */
export function getDevAppointmentsBusiness() {
  const day1 = devAppointmentSlotIso(1, 10);
  const day1b = devAppointmentSlotIso(1, 14);
  const day2 = devAppointmentSlotIso(2, 11);
  const dayFull = devAppointmentSlotIso(3, 9);
  const dayFull2 = devAppointmentSlotIso(5, 15);

  return {
    ...DEV_APPOINTMENTS_BUSINESS,
    slots: [
      {
        id: "slot-1",
        startAt: day1,
        endAt: devAppointmentSlotEnd(day1, 60),
        maxBookings: 2,
        appointments: [{ id: "appt-1" }],
      },
      {
        id: "slot-2",
        startAt: day1b,
        endAt: devAppointmentSlotEnd(day1b, 60),
        maxBookings: 3,
        appointments: [],
      },
      {
        id: "slot-3",
        startAt: day2,
        endAt: devAppointmentSlotEnd(day2, 60),
        maxBookings: 1,
        appointments: [],
      },
      {
        id: "slot-full-1",
        startAt: dayFull,
        endAt: devAppointmentSlotEnd(dayFull, 60),
        maxBookings: 2,
        appointments: [{ id: "appt-f1" }, { id: "appt-f2" }],
      },
      {
        id: "slot-full-2",
        startAt: dayFull2,
        endAt: devAppointmentSlotEnd(dayFull2, 60),
        maxBookings: 1,
        appointments: [{ id: "appt-f3" }],
      },
    ],
  };
}

export function getDevPreviewAppointmentsSeller() {
  const biz = getDevAppointmentsBusiness();
  const [slotA, slotB, , slotFull1, slotFull2] = biz.slots;
  const pastSlot = devAppointmentSlotIso(-3, 10);
  return [
    {
      id: "appt-seller-1",
      customerName: "יעל כהן",
      customerPhone: "0501234567",
      status: "CONFIRMED",
      notes: "שירות: תספורת\nרוצה תספורת קצרה",
      slot: {
        startAt: slotA.startAt,
        endAt: slotA.endAt,
      },
    },
    {
      id: "appt-seller-2",
      customerName: "דני לוי",
      customerPhone: "0529876543",
      status: "CONFIRMED",
      slot: {
        startAt: slotB.startAt,
        endAt: slotB.endAt,
      },
    },
    {
      id: "appt-f1",
      customerName: "רון שטרן",
      customerPhone: "0541112222",
      status: "CONFIRMED",
      slot: {
        startAt: slotFull1.startAt,
        endAt: slotFull1.endAt,
      },
    },
    {
      id: "appt-f2",
      customerName: "נועה ברק",
      customerPhone: "0534445566",
      status: "CONFIRMED",
      slot: {
        startAt: slotFull1.startAt,
        endAt: slotFull1.endAt,
      },
    },
    {
      id: "appt-f3",
      customerName: "איתי מזרחי",
      customerPhone: "0587778899",
      status: "CONFIRMED",
      slot: {
        startAt: slotFull2.startAt,
        endAt: slotFull2.endAt,
      },
    },
    {
      id: "appt-history-1",
      customerName: "מיכל אברהם",
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
  };
}
