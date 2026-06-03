/** Mock data for /dev/* previews — no database required */

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
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  storeBroadcastAt: new Date().toISOString(),
  storeTheme: "calm",
  storeLocale: "he" as const,
  storePolicy:
    "משלוחים בתוך העיר בימים א׳–ה׳. הזמנה עד 18:00 למחרת בבוקר.",
  storeTerms:
    "ההזמנה מהווה הסכמה לתנאי השימוש. ביטול עד 24 שעות לפני מועד האיסוף.",
};
