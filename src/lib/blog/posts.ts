export type BlogLocale = "he" | "en";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date (yyyy-mm-dd) — drives listing order and sitemap lastModified. */
  date: string;
  category: string;
};

/**
 * Hebrew and English posts share the same `slug` per topic so the two URLs
 * (`/blog/<slug>` and `/en/blog/<slug>`) can be cross-linked via hreflang as
 * translations of each other, not treated as duplicate content.
 */
export const BLOG_POSTS: Record<BlogLocale, BlogPostMeta[]> = {
  he: [
    {
      slug: "open-online-store-small-business",
      title: "איך לפתוח חנות אונליין לעסק קטן תוך כמה דקות (בלי אתר ובלי קוד)",
      description:
        "מדריך פשוט לפתיחת חנות אונליין לעסק קטן — בלי לדעת קוד, בלי לשכור מפתח, ובלי לחכות שבועות. ארבעה שלבים ואתם באוויר.",
      date: "2026-08-08",
      category: "התחלה מהירה",
    },
    {
      slug: "appointment-booking-system-guide",
      title: "מערכת לניהול תורים: המדריך לבחירת הפתרון הנכון לעסק שירות",
      description:
        "מספרות, קוסמטיקאיות ומטפלים — איך לבחור מערכת תורים שבאמת חוסכת זמן, ומה חייב להיות בה כדי שהיא תעבוד בשבילכם.",
      date: "2026-08-05",
      category: "ניהול תורים",
    },
    {
      slug: "stop-managing-orders-on-whatsapp",
      title: "להפסיק לנהל הזמנות בוואטסאפ: איך עוברים למערכת מסודרת בלי לאבד לקוחות",
      description:
        "וואטסאפ מעולה לתקשורת עם לקוחות, אבל גרוע כמערכת הזמנות. איך לעבור למערכת מסודרת ולהשאיר את הלקוחות איתכם.",
      date: "2026-08-01",
      category: "ניהול הזמנות",
    },
    {
      slug: "reduce-no-shows-appointments",
      title: "איך לצמצם אי-הגעה לתורים (No-Show) בעסק שירות קטן",
      description:
        "תור שלא מגיעים אליו הוא זמן עבודה שאבד. שיטות פשוטות ומוכחות לצמצום אי-הגעות בעסק שירות קטן.",
      date: "2026-07-28",
      category: "ניהול תורים",
    },
    {
      slug: "product-store-vs-appointments",
      title: "חנות מוצרים או מערכת תורים: איך לבחור את סוג החנות הנכון לעסק שלכם",
      description:
        "מוכרים מוצר או נותנים שירות בזמן קבוע? ההבדל בין חנות מוצרים למערכת תורים, ואיך לבחור נכון מההתחלה.",
      date: "2026-07-24",
      category: "התחלה מהירה",
    },
    {
      slug: "common-order-management-mistakes",
      title: "7 טעויות נפוצות בניהול הזמנות בעסק קטן (ואיך למנוע אותן)",
      description:
        "מהזמנות שנעלמות בין הודעות ועד שכחת מבצעים פעילים — שבע טעויות נפוצות שעולות לעסקים קטנים כסף וזמן, ואיך לתקן אותן.",
      date: "2026-07-21",
      category: "ניהול הזמנות",
    },
    {
      slug: "link-in-bio-for-business",
      title: "קישור אחד לעסק: למה כל בעל עסק קטן צריך דף עסק דיגיטלי",
      description:
        "לינק בביו כבר לא רק לאינפלואנסרים. איך קישור אחד לעסק הופך עוקבים באינסטגרם ואנשי קשר בוואטסאפ ללקוחות בפועל.",
      date: "2026-07-18",
      category: "שיווק לעסק קטן",
    },
    {
      slug: "simple-business-page-vs-full-website",
      title: "דף עסק פשוט או אתר מלא? 5 סיבות שלעסק קטן מספיק דף נחיתה חכם",
      description:
        "לא כל עסק קטן צריך אתר מלא עם בלוג ותפריטים מסועפים. חמש סיבות שדף עסק ממוקד עושה את העבודה טוב יותר, ומהר יותר.",
      date: "2026-07-15",
      category: "שיווק לעסק קטן",
    },
    {
      slug: "online-store-for-home-bakery",
      title: "מדריך לפתיחת חנות אונליין למאפייה ולעסקי מזון ביתיים",
      description:
        "אופות ביתיות וקונדיטוריות: איך להציג מוצרים, לתפעל הזמנות מראש לקראת אירועים וחגים, ולמכור בלי לרדוף אחרי לקוחות בטלפון.",
      date: "2026-07-11",
      category: "לפי תחום עיסוק",
    },
    {
      slug: "turning-first-time-customers-into-regulars",
      title: "מלקוח חד פעמי ללקוח קבוע: איך שירות מסודר בונה נאמנות בעסק קטן",
      description:
        "רוב העלות היא בגיוס לקוח חדש — לא בשימור אחד קיים. איך תהליך הזמנה מסודר הופך קונים חד-פעמיים ללקוחות חוזרים.",
      date: "2026-07-08",
      category: "שימור לקוחות",
    },
  ],
  en: [
    {
      slug: "open-online-store-small-business",
      title: "How to Open an Online Store for Your Small Business in Minutes (No Website, No Code)",
      description:
        "A simple guide to launching an online store for a small business — no coding, no developer, no weeks of waiting. Four steps and you're live.",
      date: "2026-08-08",
      category: "Getting Started",
    },
    {
      slug: "appointment-booking-system-guide",
      title: "Appointment Booking System: How to Choose the Right One for a Service Business",
      description:
        "Salons, therapists, and consultants — how to pick a booking system that actually saves time, and what it needs to have to work for you.",
      date: "2026-08-05",
      category: "Booking & Scheduling",
    },
    {
      slug: "stop-managing-orders-on-whatsapp",
      title: "Stop Managing Orders on WhatsApp: How to Switch to a Real System Without Losing Customers",
      description:
        "WhatsApp is great for talking to customers and terrible as an order system. How to move to an organized workflow while keeping the channel customers already use.",
      date: "2026-08-01",
      category: "Order Management",
    },
    {
      slug: "reduce-no-shows-appointments",
      title: "How to Reduce No-Shows for a Small Service Business",
      description:
        "A missed appointment is lost working time. Simple, proven ways small service businesses cut down on no-shows.",
      date: "2026-07-28",
      category: "Booking & Scheduling",
    },
    {
      slug: "product-store-vs-appointments",
      title: "Product Store or Booking System: Which One Fits Your Business?",
      description:
        "Selling a product or delivering a time-based service? The real difference between a product store and an appointment system, and how to choose correctly from day one.",
      date: "2026-07-24",
      category: "Getting Started",
    },
    {
      slug: "common-order-management-mistakes",
      title: "7 Common Order Management Mistakes Small Businesses Make (and How to Fix Them)",
      description:
        "From orders lost between chat apps to forgotten active promotions — seven mistakes that quietly cost small businesses money and time, and how to fix each one.",
      date: "2026-07-21",
      category: "Order Management",
    },
    {
      slug: "link-in-bio-for-business",
      title: "One Link for Your Business: Why Every Small Business Needs a Digital Business Page",
      description:
        "Link-in-bio isn't just for influencers anymore. How one shareable business link turns Instagram followers and WhatsApp contacts into paying customers.",
      date: "2026-07-18",
      category: "Marketing",
    },
    {
      slug: "simple-business-page-vs-full-website",
      title: "Simple Business Page or Full Website? 5 Reasons a Small Business Only Needs a Smart Landing Page",
      description:
        "Not every small business needs a full website with a blog and a sprawling menu. Five reasons a focused business page gets the job done better and faster.",
      date: "2026-07-15",
      category: "Marketing",
    },
    {
      slug: "online-store-for-home-bakery",
      title: "How to Open an Online Store for a Home Bakery or Food Business",
      description:
        "Home bakers and pastry makers: how to showcase products, handle pre-orders around events and holidays, and sell without chasing customers by phone.",
      date: "2026-07-11",
      category: "By Business Type",
    },
    {
      slug: "turning-first-time-customers-into-regulars",
      title: "From One-Time Buyer to Regular: How Organized Service Builds Loyalty for Small Businesses",
      description:
        "Most of the cost is in winning a new customer, not keeping an existing one. How an organized ordering process turns one-time buyers into repeat customers.",
      date: "2026-07-08",
      category: "Customer Retention",
    },
  ],
};

export function getBlogPosts(locale: BlogLocale): BlogPostMeta[] {
  return BLOG_POSTS[locale];
}

export function getBlogPostMeta(
  locale: BlogLocale,
  slug: string
): BlogPostMeta | undefined {
  return BLOG_POSTS[locale].find((post) => post.slug === slug);
}

export function getRelatedPosts(
  locale: BlogLocale,
  slug: string,
  count = 3
): BlogPostMeta[] {
  return BLOG_POSTS[locale].filter((post) => post.slug !== slug).slice(0, count);
}

export function blogPathFor(locale: BlogLocale, slug?: string): string {
  const base = locale === "en" ? "/en/blog" : "/blog";
  return slug ? `${base}/${slug}` : base;
}
