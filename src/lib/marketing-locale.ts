import { SITE_LOCALE } from "@/lib/site-locale";

export type MarketingLocale = "en" | "he";

export const MARKETING_LOCALE_KEY = "bizilink-marketing-locale";

export type MarketingCopy = {
  loading: string;
  navHome: string;
  navProduct: string;
  navPricing: string;
  navContact: string;
  startTrial: string;
  contactUs: string;
  scroll: string;
  heroTagline: string;
  eyebrowProduct: string;
  productTitle: string;
  productTitleEm: string;
  productLead: string;
  benefits: { title: string; body: string }[];
  usageSteps: { title: string; body: string }[];
  eyebrowPricing: string;
  pricingTitle: string;
  pricingTitleEm: string;
  premiumBadge: string;
  premiumPeriod: string;
  premiumTrial: string;
  premiumFeatures: string[];
  getPremium: string;
  ultimateBadge: string;
  ultimatePeriod: string;
  ultimateFeatures: string[];
  getUltimate: string;
  enterpriseHeadline: string;
  learnMore: string;
  pricingNote: string;
  tryNow: string;
  eyebrowContact: string;
  contactTitle: string;
  contactTitleEm: string;
  demoBookLead: string;
  contactPhoneEyebrow: string;
  contactPhoneHint: string;
  contactPhoneCall: string;
  whatsappMegaCta: string;
  footerCopyPeymiz: string;
  privacy: string;
  terms: string;
  refund: string;
  footerPricing: string;
  toggleTheme: string;
  menuOpen: string;
  menuClose: string;
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
  authSignInTitle: string;
  authCreateAccountTitle: string;
  authGoogleEntryTitle: string;
  authFullName: string;
  authMobilePhone: string;
  authPassword: string;
  authPhone: string;
  authForgotPassword: string;
  authSubmitSignIn: string;
  authSubmitSignUp: string;
  authLoading: string;
  authSignUpTerms: string;
  authAlreadyRegistered: string;
  authNoAccount: string;
  authSignUpClosedTitle: string;
  authSignUpClosedSub: string;
  authSignUpClosedAlert: string;
  authGoToSignIn: string;
  authPasswordResetInfo: string;
  authLoginError: string;
  authSignupError: string;
  authServerError: string;
  authNetworkError: string;
  authGoogleButton: string;
  authGoogleLoading: string;
  authGoogleError: string;
  authGoogleCancelled: string;
  authGoogleNotConfigured: string;
  authGoogleSignupSub: string;
  authGoogleLoginSub: string;
  authGoogleTermsPrefix: string;
  authGoogleTermsMiddle: string;
  authGoogleTermsSuffix: string;
  onboardTitle: string;
  onboardBusinessName: string;
  onboardDescription: string;
  onboardStoreType: string;
  onboardProductStore: string;
  onboardAppointments: string;
  onboardAcceptTermsPrefix: string;
  onboardAcceptTermsMiddle: string;
  onboardAcceptTermsSuffix: string;
  onboardAcceptTermsAria: string;
  onboardSubmit: string;
  onboardCreating: string;
  onboardTermsError: string;
};

export const MARKETING_COPY: Record<MarketingLocale, MarketingCopy> = {
  en: {
    loading: "Loading Peymiz...",
    navHome: "Home",
    navProduct: "Who are we",
    navPricing: "Pricing",
    navContact: "Contact",
    startTrial: "Free Trial",
    contactUs: "Contact Us",
    scroll: "Scroll",
    heroTagline: "One simple link for your small business.",
    eyebrowProduct: "Who are we",
    productTitle: "Four simple steps.",
    productTitleEm: "You're live.",
    productLead:
      "Peymiz helps business owners receive organized orders instead of running between phone calls and messages.",
    usageSteps: [
      {
        title: "Open your store",
        body: "Set up your Peymiz business page in just a few minutes.",
      },
      {
        title: "Add products",
        body: "List what you sell or the services you offer — photos, prices, and details.",
      },
      {
        title: "Share with customers",
        body: "Send one link on WhatsApp, Instagram, or anywhere customers find you.",
      },
      {
        title: "Receive orders",
        body: "Get orders and messages straight to your dashboard — organized and simple.",
      },
    ],
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
    premiumBadge: "Monthly Plan",
    premiumPeriod: "/ month",
    premiumTrial: "14-day free trial",
    premiumFeatures: [
      "Full Peymiz access",
      "Business page + shareable link",
      "Orders, bookings & messages dashboard",
      "Product store or booking",
    ],
    getPremium: "Get started",
    ultimateBadge: "Large businesses",
    ultimatePeriod: "",
    ultimateFeatures: [
      "High order volume & multiple locations",
      "Custom setup and onboarding",
      "Priority support",
      "Pricing tailored to your business",
    ],
    getUltimate: "Contact us",
    enterpriseHeadline: "Custom",
    learnMore: "Learn more",
    pricingNote: "Start with a free trial. Upgrade when you're ready to scale.",
    tryNow: "TRY NOW",
    eyebrowContact: "Contact",
    contactTitle: "Interested in trying",
    contactTitleEm: "Peymiz?",
    demoBookLead: "Call us for a personal walkthrough of Peymiz.",
    contactPhoneEyebrow: "Contact",
    contactPhoneHint: "Available Sun–Thu, 10:00–16:00 (Israel time)",
    contactPhoneCall: "Call now",
    whatsappMegaCta: "Chat with us on WhatsApp",
    footerCopyPeymiz: "© 2026 Peymiz. B2B software for small businesses.",
    privacy: "Privacy",
    terms: "Terms",
    refund: "Refund",
    footerPricing: "Pricing",
    toggleTheme: "Toggle light and dark mode",
    menuOpen: "Open menu",
    menuClose: "Close menu",
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
    authSignInTitle: "Sign in",
    authCreateAccountTitle: "Create account",
    authGoogleEntryTitle: "Sign in",
    authFullName: "Full name",
    authMobilePhone: "Mobile phone",
    authPassword: "Password",
    authPhone: "Phone",
    authForgotPassword: "Forgot password?",
    authSubmitSignIn: "Sign in",
    authSubmitSignUp: "Sign up",
    authLoading: "One moment...",
    authSignUpTerms:
      "By signing up you agree to the Terms of Service and Privacy Policy",
    authAlreadyRegistered: "Already registered?",
    authNoAccount: "No account?",
    authSignUpClosedTitle: "Sign-up is closed",
    authSignUpClosedSub: "The platform is open to existing users only",
    authSignUpClosedAlert:
      "New stores cannot be opened right now. If you already have an account, sign in.",
    authGoToSignIn: "Go to sign in",
    authPasswordResetInfo: "Password updated — you can sign in with your new password",
    authLoginError: "Could not sign in — check phone and password",
    authSignupError: "Could not create account",
    authServerError: "Temporary server issue. Please try again later.",
    authNetworkError: "No server connection — check your internet and try again",
    authGoogleButton: "Continue with Google",
    authGoogleLoading: "Signing in…",
    authGoogleError: "Google sign-in failed — try again",
    authGoogleCancelled: "Google sign-in was cancelled",
    authGoogleNotConfigured: "Google sign-in is not available right now",
    authGoogleSignupSub: "Free sign-up with your Google account",
    authGoogleLoginSub: "Sign in with your Google account",
    authGoogleTermsPrefix: "By continuing, you agree to the",
    authGoogleTermsMiddle: "and",
    authGoogleTermsSuffix: ".",
    onboardTitle: "Open your business",
    onboardBusinessName: "Business name",
    onboardDescription: "Short description",
    onboardStoreType: "Store type",
    onboardProductStore: "Product store",
    onboardAppointments: "Appointments",
    onboardAcceptTermsPrefix: "I have read and agree to the",
    onboardAcceptTermsMiddle: "and",
    onboardAcceptTermsSuffix: ".",
    onboardAcceptTermsAria: "Accept terms and privacy policy",
    onboardSubmit: "Open store",
    onboardCreating: "Creating...",
    onboardTermsError: "Please accept the Terms of Service and Privacy Policy",
  },
  he: {
    loading: "טוען את Peymiz...",
    navHome: "בית",
    navProduct: "מי אנחנו",
    navPricing: "מחירים",
    navContact: "צור קשר",
    startTrial: "נסיון בחינם",
    contactUs: "צור קשר",
    scroll: "גלול",
    heroTagline: "קישור אחד פשוט לעסק שלך.",
    eyebrowProduct: "מי אנחנו",
    productTitle: "ארבעה שלבים פשוטים.",
    productTitleEm: "ואתם באוויר.",
    productLead:
      "Peymiz עוזרת לבעלי עסקים לקבל הזמנות מסודרות במקום להתרוצץ בין טלפון והודעות.",
    usageSteps: [
      {
        title: "פתיחת חנות",
        body: "פותחים את דף העסק ב-Peymiz תוך דקות — בלי טכנולוגיה מסובכת.",
      },
      {
        title: "הוספת מוצרים",
        body: "מפרסמים מה שאתם מוכרים או השירותים שאתם מציעים — תמונות, מחירים ופרטים.",
      },
      {
        title: "שליחה ללקוח",
        body: "שולחים קישור אחד בוואטסאפ, אינסטגרם או בכל מקום שהלקוחות מוצאים אתכם.",
      },
      {
        title: "קבלת הזמנות",
        body: "מקבלים הזמנות והודעות ישירות ללוח הבקרה — מסודר ופשוט.",
      },
    ],
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
    premiumBadge: "תוכנית חודשית",
    premiumPeriod: "/ חודש",
    premiumTrial: "14 יום ניסיון חינם",
    premiumFeatures: [
      "גישה מלאה ל-Peymiz",
      "דף עסק + קישור לשיתוף",
      "לוח בקרה להזמנות, תורים והודעות",
      "חנות מוצרים או תורים",
    ],
    getPremium: "הרשמה",
    ultimateBadge: "עסקים גדולים",
    ultimatePeriod: "",
    ultimateFeatures: [
      "נפח הזמנות גבוה וסניפים מרובים",
      "התאמה והקמה מותאמת אישית",
      "תמיכה בעדיפות",
      "מחיר לפי צרכי העסק",
    ],
    getUltimate: "צור קשר",
    enterpriseHeadline: "לעסקים גדולים",
    learnMore: "למידע נוסף",
    pricingNote: "מתחילים בנסיון חינם. משדרגים כשמוכנים לגדול.",
    tryNow: "נסו עכשיו",
    eyebrowContact: "צור קשר",
    contactTitle: "מעוניינים לנסות את",
    contactTitleEm: "Peymiz?",
    demoBookLead: "התקשרו אלינו לתיאום הדרכה אישית על Peymiz.",
    contactPhoneEyebrow: "צור קשר",
    contactPhoneHint: "זמינים בימים א׳–ה׳, 10:00–16:00",
    contactPhoneCall: "התקשרו עכשיו",
    whatsappMegaCta: "דברו איתנו בוואטסאפ",
    footerCopyPeymiz: "© 2026 Peymiz. תוכנה לעסקים קטנים.",
    privacy: "פרטיות",
    terms: "תנאים",
    refund: "החזרים",
    footerPricing: "מחירים",
    toggleTheme: "החלפת מצב בהיר/כהה",
    menuOpen: "פתיחת תפריט",
    menuClose: "סגירת תפריט",
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
    authSignInTitle: "התחברות",
    authCreateAccountTitle: "יצירת חשבון",
    authGoogleEntryTitle: "כניסה",
    authFullName: "שם מלא",
    authMobilePhone: "טלפון נייד",
    authPassword: "סיסמה",
    authPhone: "טלפון",
    authForgotPassword: "שכחת סיסמה?",
    authSubmitSignIn: "התחברות",
    authSubmitSignUp: "הרשמה",
    authLoading: "רגע...",
    authSignUpTerms:
      "בהרשמה אתה מסכים לתנאי השימוש ולמדיניות הפרטיות",
    authAlreadyRegistered: "כבר רשום?",
    authNoAccount: "אין חשבון?",
    authSignUpClosedTitle: "ההרשמה סגורה",
    authSignUpClosedSub: "הפלטפורמה פתוחה למשתמשים קיימים בלבד",
    authSignUpClosedAlert:
      "לא ניתן לפתוח חנויות חדשות כרגע. אם יש לך חשבון, התחבר.",
    authGoToSignIn: "מעבר להתחברות",
    authPasswordResetInfo: "הסיסמה עודכנה — אפשר להתחבר עם הסיסמה החדשה",
    authLoginError: "לא הצלחנו להתחבר — בדוק טלפון וסיסמה",
    authSignupError: "לא הצלחנו ליצור חשבון",
    authServerError: "תקלה זמנית בשרת. נסה שוב מאוחר יותר.",
    authNetworkError: "אין חיבור לשרת — בדוק את האינטרנט ונסה שוב",
    authGoogleButton: "המשך עם Google",
    authGoogleLoading: "מתחבר…",
    authGoogleError: "התחברות עם Google נכשלה — נסו שוב",
    authGoogleCancelled: "התחברות Google בוטלה",
    authGoogleNotConfigured: "כניסה עם Google לא זמינה כרגע",
    authGoogleSignupSub: "הרשמה חינמית עם חשבון Google",
    authGoogleLoginSub: "התחברות עם חשבון Google",
    authGoogleTermsPrefix: "בכניסה את/ה מסכים/ה ל",
    authGoogleTermsMiddle: " ו",
    authGoogleTermsSuffix: ".",
    onboardTitle: "פתיחת העסק שלך",
    onboardBusinessName: "שם העסק",
    onboardDescription: "תיאור קצר",
    onboardStoreType: "סוג חנות",
    onboardProductStore: "חנות מוצרים",
    onboardAppointments: "תורים",
    onboardAcceptTermsPrefix: "קראתי ואני מסכים/ה ל",
    onboardAcceptTermsMiddle: "ול",
    onboardAcceptTermsSuffix: ".",
    onboardAcceptTermsAria: "אישור תנאים ומדיניות פרטיות",
    onboardSubmit: "פתיחת חנות",
    onboardCreating: "יוצר...",
    onboardTermsError: "יש לאשר את תנאי השימוש ומדיניות הפרטיות",
  },
};

export function normalizeMarketingLocale(
  value: string | null | undefined
): MarketingLocale {
  return value === "he" ? "he" : SITE_LOCALE;
}

export function applyMarketingLocale(locale: MarketingLocale) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = locale === "he" ? "he" : "en";
  root.dir = locale === "he" ? "rtl" : "ltr";
  root.dataset.locale = locale;
}
