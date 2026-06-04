/** Mock data for /dev/* previews — no database required */

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

export const DEV_PREVIEW_COMMUNITY_CHAT: StoreChatMessageDto[] = [
  {
    id: "demo-comm-1",
    channel: "COMMUNITY",
    customerPhone: "0501234567",
    customerName: "יעל כהן",
    authorRole: "CUSTOMER",
    body: "מישהו הזמין כבר עוגת שוקולד השבוע?",
    createdAt: "2026-06-03T08:00:00.000Z",
    likeCount: 2,
    likedByPhones: ["0529876543", "0541112233"],
  },
  {
    id: "demo-comm-2",
    channel: "COMMUNITY",
    customerPhone: "0529876543",
    customerName: "דני לוי",
    authorRole: "CUSTOMER",
    body: "המליצו על הקרואסון — ממש טעים",
    createdAt: "2026-06-03T08:30:00.000Z",
    likeCount: 1,
    likedByPhones: ["0501234567"],
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
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-2",
    customerName: "דני לוי",
    customerPhone: "052-9876543",
    subject: "מוצרים ללא גלוטן",
    message: "האם יש עוגות ללא גלוטן?",
    sellerReply: "כן! יש לנו עוגת שוקולד וקרואסון ללא גלוטן — כדאי להזמין יום מראש.",
    sellerReplyAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEV_PREVIEW_ORDERS = [
  {
    id: "ord-1",
    customerName: "יעל כהן",
    customerPhone: "050-1234567",
    status: "PENDING",
    statusLabel: "ממתין",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
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
    id: "ord-2",
    customerName: "דני לוי",
    customerPhone: "052-9876543",
    status: "CONFIRMED",
    statusLabel: "אושר",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "עוגת שוקולד",
        quantity: 2,
        lineTotal: 198,
        imageUrl: null as string | null,
      },
    ],
  },
  {
    id: "ord-3",
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
];

export const DEV_STORE_OWNER_NAME = "יעל";

/** מדד מצב חנות לתצוגת dev — 80% עם שתי סיבות */
export const DEV_STORE_HEALTH = {
  percent: 80,
  deductions: [
    {
      id: "demo-inquiry",
      kind: "unanswered_inquiry" as const,
      label: "פנייה ללא מענה",
      detail:
        "דני לוי: האם יש עוגות ללא גלוטן? — עדיין לא נשלחה תשובה",
      penaltyPercent: 10,
      href: "/dev/seller/customers/inquiries",
    },
    {
      id: "demo-review",
      kind: "bad_review" as const,
      label: "ביקורת שלילית",
      detail: "לקוח דירג 2 כוכבים: «המשלוח התעכב יותר מדי»",
      penaltyPercent: 10,
    },
  ],
};

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
];

export const DEV_STORE_BUSINESS = {
  slug: "demo-store",
  name: "המאפייה שלי (תצוגה)",
  description: null,
  type: "STORE" as const,
  products: [
    {
      id: "1",
      name: "עוגת שוקולד",
      description: "עוגה עשירה",
      imageUrl: null,
      price: 120,
      salePrice: 99,
      stock: 5,
    },
    {
      id: "2",
      name: "קרואסון",
      description: null,
      imageUrl: null,
      price: 18,
      stock: null,
    },
  ],
  deals: [
    {
      id: "deal-1",
      name: "עוגה + קרואסון",
      dealPrice: 110,
      validUntil: "2026-12-31T23:59:59.000Z",
      products: [
        {
          id: "1",
          name: "עוגת שוקולד",
          imageUrl: null,
          price: 120,
          salePrice: 99,
          stock: 5,
        },
        {
          id: "2",
          name: "קרואסון",
          imageUrl: null,
          price: 18,
          salePrice: null,
          stock: null,
        },
      ],
    },
    {
      id: "deal-2",
      name: "מאפין + עוגיות",
      dealPrice: 40,
      validUntil: "2026-12-31T23:59:59.000Z",
      products: [
        {
          id: "demo-p5",
          name: "מאפין אוכמניות",
          imageUrl: null,
          price: 14,
          salePrice: null,
          stock: null,
        },
        {
          id: "demo-p3",
          name: "עוגיות שקדים",
          imageUrl: null,
          price: 32,
          salePrice: 28,
          stock: 12,
        },
      ],
    },
    {
      id: "deal-3",
      name: "לחם + קרואסון",
      dealPrice: 42,
      validUntil: "2026-12-31T23:59:59.000Z",
      products: [
        {
          id: "demo-p4",
          name: "לחם מחמצת",
          imageUrl: null,
          price: 28,
          salePrice: null,
          stock: 3,
        },
        {
          id: "2",
          name: "קרואסון",
          imageUrl: null,
          price: 18,
          salePrice: null,
          stock: null,
        },
      ],
    },
    {
      id: "deal-4",
      name: "טארט + עוגה",
      dealPrice: 125,
      validUntil: "2026-12-31T23:59:59.000Z",
      products: [
        {
          id: "demo-p6",
          name: "טארט לימון",
          imageUrl: null,
          price: 45,
          salePrice: 39,
          stock: 8,
        },
        {
          id: "1",
          name: "עוגת שוקולד",
          imageUrl: null,
          price: 120,
          salePrice: 99,
          stock: 5,
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
  storeTheme: "calm",
  storeLocale: "he" as const,
  storePolicy:
    "משלוחים בתוך העיר בימים א׳–ה׳. הזמנה עד 18:00 למחרת בבוקר.",
  storeTerms:
    "ההזמנה מהווה הסכמה לתנאי השימוש. ביטול עד 24 שעות לפני מועד האיסוף.",
};
