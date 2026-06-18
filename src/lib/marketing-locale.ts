export type MarketingLocale = "en" | "he";

export const MARKETING_LOCALE_KEY = "bizilink-marketing-locale";

export type MarketingCopy = {
  loading: string;
  navHome: string;
  navProduct: string;
  navPricing: string;
  navContact: string;
  startPilot: string;
  contactUs: string;
  scroll: string;
  heroTagline: string;
  heroSub: string;
  eyebrowProduct: string;
  productTitle: string;
  productTitleEm: string;
  productLead: string;
  benefits: { title: string; body: string }[];
  eyebrowPricing: string;
  pricingTitle: string;
  pricingTitleEm: string;
  pilotBadge: string;
  pilotFree: string;
  pilotPeriod: string;
  pilotFeatures: string[];
  joinPilot: string;
  premiumBadge: string;
  premiumPeriod: string;
  premiumFeatures: string[];
  getPremium: string;
  ultimateBadge: string;
  ultimatePeriod: string;
  ultimateFeatures: string[];
  getUltimate: string;
  pricingNote: string;
  tryNow: string;
  eyebrowContact: string;
  contactTitle: string;
  contactTitleEm: string;
  contactLead: string;
  email: string;
  whatsapp: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  formNamePlaceholder: string;
  formEmailPlaceholder: string;
  formMessagePlaceholder: string;
  sendMessage: string;
  messageSent: string;
  footerCopy: string;
  footerCopyPeymiz: string;
  privacy: string;
  terms: string;
  refund: string;
  footerPricing: string;
  toggleTheme: string;
  toggleLocale: string;
  localeEn: string;
  localeHe: string;
  backToHome: string;
  storeTitle: string;
  storeSub: string;
  signupsClosed: string;
  openStore: string;
  signIn: string;
  bottomHome: string;
  bottomPricing: string;
  bottomStore: string;
};

export const MARKETING_COPY: Record<MarketingLocale, MarketingCopy> = {
  en: {
    loading: "Loading BiziLink...",
    navHome: "Home",
    navProduct: "Who are we",
    navPricing: "Pricing",
    navContact: "Contact",
    startPilot: "Start Pilot",
    contactUs: "Contact Us",
    scroll: "Scroll",
    heroTagline: "One simple link for your small business.",
    heroSub:
      "Manage orders, bookings, and customer messages from one clean dashboard.",
    eyebrowProduct: "Who are we",
    productTitle: "Everything you need.",
    productTitleEm: "Nothing extra.",
    productLead:
      "BiziLink helps small businesses run online without building a custom app or juggling too many tools.",
    benefits: [
      {
        title: "One digital business page",
        body: "Your brand, services, and contact info in one clean place.",
      },
      {
        title: "One shareable link",
        body: "Send one link on Instagram, WhatsApp, or anywhere customers find you.",
      },
      {
        title: "One dashboard",
        body: "See orders, bookings, and messages in one simple owner view.",
      },
      {
        title: "Store or booking",
        body: "Sell products or take appointments — pick what fits your business.",
      },
      {
        title: "No expensive custom app",
        body: "Skip long builds and high development costs.",
      },
      {
        title: "Simple setup",
        body: "Built for small businesses that want to start fast and stay organized.",
      },
    ],
    eyebrowPricing: "Pricing",
    pricingTitle: "Start free.",
    pricingTitleEm: "Scale later.",
    pilotBadge: "Pilot Plan",
    pilotFree: "Free",
    pilotPeriod: "during pilot",
    pilotFeatures: [
      "Full BiziLink access",
      "Business page + link",
      "Dashboard for orders & messages",
      "Product store or booking",
    ],
    joinPilot: "Join the Pilot",
    premiumBadge: "Premium Plan",
    premiumPeriod: "/ month",
    premiumFeatures: [
      "Up to 500 orders per month",
      "Full BiziLink access",
      "Business page + shareable link",
      "Orders, bookings & messages dashboard",
    ],
    getPremium: "Get Premium",
    ultimateBadge: "Ultimate Plan",
    ultimatePeriod: "/ month",
    ultimateFeatures: [
      "Up to 1,000 orders per month",
      "Everything in Premium",
      "Priority support",
      "Built for growing businesses",
    ],
    getUltimate: "Get Ultimate",
    pricingNote: "Start free during pilot. Upgrade when you're ready to scale.",
    tryNow: "TRY NOW",
    eyebrowContact: "Contact",
    contactTitle: "Interested in trying",
    contactTitleEm: "BiziLink?",
    contactLead:
      "Contact us to join the pilot and get your business online with one simple link.",
    email: "Email",
    whatsapp: "WhatsApp",
    formName: "Name",
    formEmail: "Email",
    formMessage: "Message",
    formNamePlaceholder: "Your name",
    formEmailPlaceholder: "you@business.com",
    formMessagePlaceholder: "Tell us about your business...",
    sendMessage: "Send Message",
    messageSent: "Message sent ✓",
    footerCopy: "© 2026 BiziLink. One link. One dashboard.",
    footerCopyPeymiz: "© 2026 Peymiz. B2B software for small businesses.",
    privacy: "Privacy",
    terms: "Terms",
    refund: "Refund",
    footerPricing: "Pricing",
    toggleTheme: "Toggle light and dark mode",
    toggleLocale: "Switch language",
    localeEn: "EN",
    localeHe: "עב",
    backToHome: "Back to home",
    storeTitle: "Your store",
    storeSub: "Sign up for a new shop or sign in to manage an existing one.",
    signupsClosed: "New store sign-ups are closed right now.",
    openStore: "Open a store",
    signIn: "Sign in",
    bottomHome: "Home",
    bottomPricing: "Pricing",
    bottomStore: "Store",
  },
  he: {
    loading: "טוען את BiziLink...",
    navHome: "בית",
    navProduct: "מי אנחנו",
    navPricing: "מחירים",
    navContact: "צור קשר",
    startPilot: "התחל פיילוט",
    contactUs: "צור קשר",
    scroll: "גלול",
    heroTagline: "קישור אחד פשוט לעסק הקטן שלך.",
    heroSub: "נהל הזמנות, תורים והודעות לקוחות מלוח בקרה אחד ונקי.",
    eyebrowProduct: "מי אנחנו",
    productTitle: "כל מה שצריך.",
    productTitleEm: "בלי עודף.",
    productLead:
      "BiziLink עוזר לעסקים קטנים לעבוד אונליין בלי לבנות אפליקציה ייעודית או לנהל יותר מדי כלים.",
    benefits: [
      {
        title: "דף עסק דיגיטלי אחד",
        body: "המותג, השירותים ופרטי הקשר שלך במקום אחד ונקי.",
      },
      {
        title: "קישור אחד לשיתוף",
        body: "שלחו קישור אחד באינסטגרם, וואטסאפ או בכל מקום שהלקוחות מוצאים אתכם.",
      },
      {
        title: "לוח בקרה אחד",
        body: "ראו הזמנות, תורים והודעות בתצוגה פשוטה לבעל העסק.",
      },
      {
        title: "חנות או תורים",
        body: "מכירת מוצרים או קבלת תורים — בחרו מה שמתאים לעסק.",
      },
      {
        title: "בלי אפליקיה יקרה",
        body: "דלגו על פיתוח ארוך ועלויות גבוהות.",
      },
      {
        title: "הקמה פשוטה",
        body: "נבנה לעסקים קטנים שרוצים להתחיל מהר ולהישאר מסודרים.",
      },
    ],
    eyebrowPricing: "מחירים",
    pricingTitle: "מתחילים בחינם.",
    pricingTitleEm: "גדלים בהמשך.",
    pilotBadge: "תוכנית פיילוט",
    pilotFree: "חינם",
    pilotPeriod: "במהלך הפיילוט",
    pilotFeatures: [
      "גישה מלאה ל-BiziLink",
      "דף עסק + קישור",
      "לוח בקרה להזמנות והודעות",
      "חנות מוצרים או תורים",
    ],
    joinPilot: "הצטרפו לפיילוט",
    premiumBadge: "תוכנית Premium",
    premiumPeriod: "/ חודש",
    premiumFeatures: [
      "עד 500 הזמנות בחודש",
      "גישה מלאה ל-BiziLink",
      "דף עסק + קישור לשיתוף",
      "לוח בקרה להזמנות, תורים והודעות",
    ],
    getPremium: "קבל Premium",
    ultimateBadge: "תוכנית Ultimate",
    ultimatePeriod: "/ חודש",
    ultimateFeatures: [
      "עד 1,000 הזמנות בחודש",
      "הכל ב-Premium",
      "תמיכה בעדיפות",
      "לעסקים בצמיחה",
    ],
    getUltimate: "קבל Ultimate",
    pricingNote: "מתחילים בחינם בפיילוט. משדרגים כשמוכנים לגדול.",
    tryNow: "נסו עכשיו",
    eyebrowContact: "צור קשר",
    contactTitle: "מעוניינים לנסות את",
    contactTitleEm: "BiziLink?",
    contactLead:
      "צרו קשר כדי להצטרף לפיילוט ולהעלות את העסק אונליין עם קישור אחד פשוט.",
    email: "אימייל",
    whatsapp: "WhatsApp",
    formName: "שם",
    formEmail: "אימייל",
    formMessage: "הודעה",
    formNamePlaceholder: "השם שלך",
    formEmailPlaceholder: "you@business.com",
    formMessagePlaceholder: "ספרו לנו על העסק שלכם...",
    sendMessage: "שליחת הודעה",
    messageSent: "ההודעה נשלחה ✓",
    footerCopy: "© 2026 BiziLink. קישור אחד. לוח בקרה אחד.",
    footerCopyPeymiz: "© 2026 Peymiz. תוכנה לעסקים קטנים.",
    privacy: "פרטיות",
    terms: "תנאים",
    refund: "החזרים",
    footerPricing: "מחירים",
    toggleTheme: "החלפת מצב בהיר/כהה",
    toggleLocale: "החלפת שפה",
    localeEn: "EN",
    localeHe: "עב",
    backToHome: "חזרה לדף הבית",
    storeTitle: "החנות שלך",
    storeSub: "פתחו חנות חדשה או התחברו לניהול חנות קיימת.",
    signupsClosed: "הרשמות לחנויות חדשות סגורות כרגע.",
    openStore: "פתיחת חנות",
    signIn: "התחברות",
    bottomHome: "בית",
    bottomPricing: "מחירים",
    bottomStore: "חנות",
  },
};

export function normalizeMarketingLocale(
  value: string | null | undefined
): MarketingLocale {
  return value === "he" ? "he" : "en";
}

export function applyMarketingLocale(locale: MarketingLocale) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = locale === "he" ? "he" : "en";
  root.dir = locale === "he" ? "rtl" : "ltr";
  root.dataset.locale = locale;
}
