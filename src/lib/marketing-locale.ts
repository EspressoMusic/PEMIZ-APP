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
  enterpriseHeadline: string;
  learnMore: string;
  pricingNote: string;
  tryNow: string;
  eyebrowContact: string;
  contactTitle: string;
  contactTitleEm: string;
  contactLead: string;
  email: string;
  whatsapp: string;
  whatsappMegaCta: string;
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
    premiumBadge: "Monthly Plan",
    premiumPeriod: "/ month",
    premiumFeatures: [
      "Full BiziLink access",
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
    pricingNote: "Start free during pilot. Upgrade when you're ready to scale.",
    tryNow: "TRY NOW",
    eyebrowContact: "Contact",
    contactTitle: "Interested in trying",
    contactTitleEm: "BiziLink?",
    contactLead:
      "Contact us to join the pilot and get your business online with one simple link.",
    email: "Email",
    whatsapp: "WhatsApp",
    whatsappMegaCta: "Chat with us on WhatsApp",
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
    authGoogleTermsPrefix: "By continuing with Google, you agree to the",
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
    premiumBadge: "תוכנית חודשית",
    premiumPeriod: "/ חודש",
    premiumFeatures: [
      "גישה מלאה ל-BiziLink",
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
    pricingNote: "מתחילים בחינם בפיילוט. משדרגים כשמוכנים לגדול.",
    tryNow: "נסו עכשיו",
    eyebrowContact: "צור קשר",
    contactTitle: "מעוניינים לנסות את",
    contactTitleEm: "BiziLink?",
    contactLead:
      "צרו קשר כדי להצטרף לפיילוט ולהעלות את העסק אונליין עם קישור אחד פשוט.",
    email: "אימייל",
    whatsapp: "WhatsApp",
    whatsappMegaCta: "דברו איתנו בוואטסאפ",
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
    authGoogleTermsPrefix: "בלחיצה על \"המשך עם Google\" את/ה מסכים/ה ל",
    authGoogleTermsMiddle: "ול",
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
  return value === "en" ? "en" : "he";
}

export function applyMarketingLocale(locale: MarketingLocale) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = locale === "he" ? "he" : "en";
  root.dir = locale === "he" ? "rtl" : "ltr";
  root.dataset.locale = locale;
}
