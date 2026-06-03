/** Mock data for /dev/* previews — no database required */

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
    },
    {
      id: "2",
      name: "קרואסון",
      description: null,
      imageUrl: null,
      price: 18,
    },
  ],
  deals: [
    {
      id: "deal-1",
      name: "עוגה + קרואסון",
      dealPrice: 110,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      productA: {
        id: "1",
        name: "עוגת שוקולד",
        imageUrl: null,
        price: 120,
        salePrice: 99,
      },
      productB: {
        id: "2",
        name: "קרואסון",
        imageUrl: null,
        price: 18,
        salePrice: null,
      },
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
    { id: "1", question: "שעות פתיחה?", answer: "א׳–ה׳ 8:00–20:00" },
  ],
  storeUrl: "http://localhost:3000/dev/customer",
  storeTheme: "calm",
};
