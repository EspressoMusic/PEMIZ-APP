/** Mock data for /dev/* previews — no database required */

export const DEV_PREVIEW_INQUIRIES = [
  {
    id: "inq-1",
    customerName: "יעל כהן",
    customerPhone: "050-1234567",
    message: "יש אפשרות למשלוח ביום שישי?",
    sellerReply: null,
    sellerReplyAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inq-2",
    customerName: "דני לוי",
    customerPhone: "052-9876543",
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
    statusLabel: "ממתין",
    items: [
      { name: "עוגת שוקולד", quantity: 1, lineTotal: 99 },
      { name: "קרואסון", quantity: 2, lineTotal: 36 },
    ],
  },
  {
    id: "ord-2",
    customerName: "דני לוי",
    customerPhone: "052-9876543",
    statusLabel: "אושר",
    items: [{ name: "עוגת שוקולד", quantity: 2, lineTotal: 198 }],
  },
];

export const DEV_STORE_BUSINESS = {
  slug: "demo-store",
  name: "המאפייה שלי (תצוגה)",
  description: "תצוגה מקומית לעריכת עיצוב — בלי התחברות",
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
  faqItems: [] as { id: string; question: string; answer: string }[],
  storeUrl: "http://localhost:3000/dev/customer",
  storeBroadcast: "מבצע השבוע: 10% הנחה על כל המוצרים עד יום שישי!",
  storeBroadcastAt: new Date().toISOString(),
  storeTheme: "ocean",
  storeLocale: "he" as const,
  storePolicy:
    "משלוחים בתוך העיר בימים א׳–ה׳. הזמנה עד 18:00 למחרת בבוקר.",
  storeTerms:
    "ההזמנה מהווה הסכמה לתנאי השימוש. ביטול עד 24 שעות לפני מועד האיסוף.",
};
