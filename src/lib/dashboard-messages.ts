import type { CustomerLocale } from "@/lib/customer-preferences";

type AppLocale = CustomerLocale;

export type DashboardLabels = {
  navHome: string;
  navActions: string;
  navSeller: string;
  backToStore: string;
  backToActions: string;
  backToCustomers: string;
  products: string;
  orders: string;
  deals: string;
  limits: string;
  settings: string;
  alerts: string;
  installApp: string;
  installAppTitle: string;
  installAppSubtitle: string;
  installAppInstalledTitle: string;
  installAppInstalledHint: string;
  installAppButton: string;
  installAppIosStep1: string;
  installAppIosStep2: string;
  installAppIosStep3: string;
  installAppAndroidHint: string;
  installAppDesktopHint: string;
  installAppBannerTitle: string;
  installAppBannerHint: string;
  installAppBannerInstall: string;
  installAppBannerDismiss: string;
  pushEnableTitle: string;
  pushEnableHint: string;
  pushSubscribeButton: string;
  pushSubscribed: string;
  pushPermissionDenied: string;
  pushUnsupported: string;
  pushUnconfigured: string;
  pushSubscribeError: string;
  pushPreviewOnly: string;
  subscription: string;
  subscriptionPlansTitle: string;
  subscriptionPlansHint: string;
  subscriptionPremium: string;
  subscriptionUltimate: string;
  subscriptionPerMonth: string;
  subscriptionChoose: string;
  subscriptionComingSoon: string;
  subscriptionPreviewOnly: string;
  subscriptionPremiumFeature1: string;
  subscriptionPremiumFeature2: string;
  subscriptionPremiumFeature3: string;
  subscriptionUltimateFeature1: string;
  subscriptionUltimateFeature2: string;
  subscriptionUltimateFeature3: string;
  alertsEnableTitle: string;
  alertsEnableHint: string;
  alertOnCustomerInquiry: string;
  alertOnChatMessage: string;
  alertOnNewOrder: string;
  alertOnLowStock: string;
  accountAndLink: string;
  extras: string;
  customers: string;
  customerMessage: string;
  customerInquiries: string;
  sellerChatTitle: string;
  sellerChatHint: string;
  sellerChatEmpty: string;
  sellerChatTabPrivate: string;
  sellerChatTabCommunity: string;
  sellerChatBackToList: string;
  chatLoading: string;
  chatEmpty: string;
  chatPlaceholder: string;
  chatReply: string;
  replyingTo: string;
  cancelReply: string;
  store: string;
  faq: string;
  salesAndProfit: string;
  orderStatsTitle: string;
  styleColorLanguage: string;
  storeLanguageForCustomers: string;
  storeMode: string;
  hebrew: string;
  english: string;
  back: string;
  close: string;
  save: string;
  cancel: string;
  confirm: string;
  send: string;
  saved: string;
  saveError: string;
  networkError: string;
  loadError: string;
  previewSavedHint: string;
  activeOrders: string;
  orderHistory: string;
  noActiveOrders: string;
  noOrderHistory: string;
  noOrders: string;
  noOrdersYet: string;
  total: string;
  confirmOrder: string;
  completeOrder: string;
  cancelOrder: string;
  pending: string;
  confirmed: string;
  completed: string;
  cancelled: string;
  order: string;
  unit: string;
  units: string;
  customer: string;
  customerJoinDate: string;
  continueToConfirm: string;
  confirmBeforeSave: string;
  confirmAndSave: string;
  backToEdit: string;
  addDeal: string;
  existingDeals: string;
  noExistingDeals: string;
  closeForm: string;
  saveDeal: string;
  saving: string;
  adding: string;
  sending: string;
  edit: string;
  delete: string;
  active: string;
  inactive: string;
  hidden: string;
  show: string;
  hide: string;
  enableOrderLimit: string;
  orderScheduleLimitTitle: string;
  saveOrderSettings: string;
  whichDays: string;
  whichHours: string;
  fromHour: string;
  toHour: string;
  addProduct: string;
  messageSent: string;
  dayToggleHint: string;
  scheduleNeedOpenDay: string;
  scheduleInvalidHours: string;
  scheduleServerError: string;
  hello: string;
  storeHealthTitle: string;
  storeHealthPerfect: string;
  inquiryUpdates: string;
  noNewInquiries: string;
  inquiriesPending: string;
  inquiriesAllAnswered: string;
  noInquiriesYet: string;
  replyRequired: string;
  replyToCustomer: string;
  sendReply: string;
  yourReply: string;
  customerInquiryLabel: string;
  answerCustomer: string;
  whatsappPhoneLabel: string;
  whatsappSave: string;
  whatsappTestSend: string;
  whatsappInvalidPhone: string;
  whatsappSaved: string;
  whatsappTestOnlyLive: string;
  whatsappAria: string;
  whatsappIntro: string;
  whatsappMetaNote: string;
  whatsappConnect: string;
  whatsappDisconnect: string;
  whatsappStatusConnected: string;
  whatsappStatusDisconnected: string;
  whatsappStatusPhonePending: string;
  whatsappStatusServerPending: string;
  whatsappStatusVerifyPending: string;
  whatsappUseAccountPhone: string;
  whatsappConnectedHint: string;
  whatsappConnectStepPhone: string;
  whatsappConnectStepVerify: string;
  whatsappConnectStepDone: string;
  faqNoQuestionsYet: string;
  scheduleDemoHint: string;
  schedulePickDaysHint: string;
  periodThreeDays: string;
  faqPolicyTitle: string;
  faqAddQuestion: string;
  savePolicy: string;
  question: string;
  answer: string;
  addQuestion: string;
  policyPlaceholder: string;
  questionPlaceholder: string;
  answerPlaceholder: string;
  faqStorePolicy: string;
  faqHiddenFromCustomers: string;
  confirmDeleteFaq: string;
  confirmDeleteDeal: string;
  productName: string;
  productPrice: string;
  productDescription: string;
  productDiscount: string;
  productDiscountAndStock: string;
  productDiscountPrice: string;
  productDiscountLimit: string;
  productMaxDiscount: string;
  productStock: string;
  productStockUnlimited: string;
  productDiscountRequired: string;
  productDiscountBelowPrice: string;
  productMaxDiscountRequired: string;
  productStockInvalid: string;
  productStockRequired: string;
  productImageUpload: string;
  productImageUploading: string;
  productImageDropHint: string;
  productImagePreviewAlt: string;
  productImageRemove: string;
  productImageTypeError: string;
  productImageSizeError: string;
  productImageReadError: string;
  dealName: string;
  dealPrice: string;
  dealDate: string;
  dealFillName: string;
  dealFillPrice: string;
  dealPickProduct: string;
  dealMaxProducts: string;
  dealPickDate: string;
  dealDateFuture: string;
  dealSaveFailed: string;
  periodOneDay: string;
  periodOneWeek: string;
  periodTwoWeeks: string;
  periodCustom: string;
  totalRevenue: string;
  totalProfit: string;
  salesCount: string;
  salesChartTitle: string;
  revenueHint: string;
  profitHint: string;
  ordersCountHint: string;
  periodWeek: string;
  periodMonth: string;
  periodYear: string;
  periodSummaryWeek: string;
  periodSummaryMonth: string;
  periodSummaryYear: string;
  ownerAccount: string;
  email: string;
  storeStatus: string;
  storeActive: string;
  storeInactive: string;
  storeInactiveHint: string;
  logoutTitle: string;
  logoutHint: string;
  logout: string;
  deleteStoreTitle: string;
  deleteStoreButton: string;
  deleteStoreModalTitle: string;
  deleteStoreModalBody: string;
  deleteStoreModalBodyNamed: string;
  deleteStoreModalConfirm: string;
  deleteStoreError: string;
  deleteStorePreviewOnly: string;
  sendCustomerWhatsApp: string;
  deleting: string;
  helpTextTitle: string;
  helpTextDesc: string;
  shareStoreLink: string;
  storeLinkBarLabel: string;
  copyLink: string;
  copied: string;
  customerPreview: string;
  broadcastMessage: string;
  broadcastPlaceholder: string;
  sendToAllCustomers: string;
  broadcastWriteMessage: string;
  broadcastSentPreview: string;
  broadcastPublished: string;
  broadcastHistory: string;
  broadcastHistoryEmpty: string;
  anonymousCustomer: string;
  noCustomersYet: string;
  customerOrderCount: string;
  customerLastOrder: string;
  sendCustomerMessage: string;
  callCustomer: string;
  customerMessagePlaceholder: string;
  customerMessageInvalidPhone: string;
  storeDescription: string;
  storeDescriptionPlaceholder: string;
  slotStart: string;
  slotEnd: string;
  maxOrders: string;
  price: string;
  description: string;
  revenue: string;
  trendStable: string;
  trendUp: string;
  trendDown: string;
};

const HE: DashboardLabels = {
  navHome: "בית",
  navActions: "פעולות",
  navSeller: "ניווט מוכר",
  backToStore: "חזרה לחנות",
  backToActions: "חזרה לפעולות",
  backToCustomers: "חזרה ללקוחות",
  products: "מוצרים",
  orders: "הזמנות",
  deals: "דילים",
  limits: "הגבלות",
  settings: "הגדרות",
  accountAndLink: "חשבון וקישור לחנות",
  extras: "פרטים נוספים",
  customers: "לקוחות",
  customerMessage: "הודעה ללקוחות",
  customerInquiries: "פניות לקוחות",
  sellerChatTitle: "צ'אט עם לקוחות",
  sellerChatHint: "בחר שיחה והגב כשמתאים לך",
  sellerChatEmpty: "אין הודעות צ'אט מלקוחות עדיין",
  sellerChatTabPrivate: "צ'אטים פרטיים",
  sellerChatTabCommunity: "צ'אט קהילתי",
  sellerChatBackToList: "רשימת שיחות",
  chatLoading: "טוען…",
  chatEmpty: "אין הודעות עדיין",
  chatPlaceholder: "כתוב הודעה…",
  chatReply: "הגב",
  replyingTo: "משיב ל־",
  cancelReply: "ביטול",
  store: "החנות",
  faq: "שאלות ותשובות",
  salesAndProfit: "מכירות ורווחים",
  orderStatsTitle: "סטטיסטיקת הזמנות",
  styleColorLanguage: "סגנון ושפה לחנות",
  storeLanguageForCustomers: "שפת החנות ללקוחות",
  storeMode: "מצב תצוגה",
  hebrew: "עברית",
  english: "English",
  back: "חזרה",
  close: "סגור",
  save: "שמור",
  cancel: "ביטול",
  confirm: "אישור",
  send: "שלח",
  saved: "נשמר",
  saveError: "שגיאה בשמירה",
  networkError: "שגיאת רשת",
  loadError: "שגיאה בטעינה",
  previewSavedHint: "נשמר בתצוגה — בדשבורד האמיתי לחץ שמור לאחר ההתחברות",
  activeOrders: "הזמנות פעילות",
  orderHistory: "היסטוריה",
  noActiveOrders: "אין הזמנות פעילות",
  noOrderHistory: "אין הזמנות בהיסטוריה",
  noOrders: "אין הזמנות.",
  noOrdersYet: "אין הזמנות עדיין.",
  total: "סה״כ",
  confirmOrder: "אשר",
  completeOrder: "סמן כהושלם",
  cancelOrder: "בטל",
  pending: "ממתין",
  confirmed: "אושר",
  completed: "הושלם",
  cancelled: "בוטל",
  order: "הזמנה",
  unit: "יחידה",
  units: "יחידות",
  customer: "לקוח",
  customerJoinDate: "תאריך הצטרפות",
  continueToConfirm: "המשך לאישור",
  confirmBeforeSave: "אישור לפני שמירה",
  confirmAndSave: "אישור ושמירה",
  backToEdit: "חזרה לעריכה",
  addDeal: "הוסף דיל",
  existingDeals: "דילים קיימים",
  noExistingDeals: "אין דילים עדיין",
  closeForm: "סגור טופס",
  saveDeal: "שמור דיל",
  saving: "שומר...",
  adding: "מוסיף...",
  sending: "שולח...",
  edit: "ערוך",
  delete: "מחק",
  active: "פעיל",
  inactive: "מושבת",
  hidden: "מוסתר",
  show: "הצג",
  hide: "הסתר",
  enableOrderLimit: "הגבל מתי לקוחות יכולים להזמין",
  orderScheduleLimitTitle: "הגבלת שעות וימי הזמנה",
  saveOrderSettings: "שמור הגדרות הזמנה",
  whichDays: "איזה ימים",
  whichHours: "איזה שעות",
  fromHour: "משעה",
  toHour: "עד שעה",
  addProduct: "הוסף מוצר",
  messageSent: "נשמר — ההגבלה פעילה ללקוחות",
  dayToggleHint: "לחיצה — פתוח/סגור להזמנות",
  scheduleNeedOpenDay: "יש להשאיר לפחות יום אחד פתוח להזמנות",
  scheduleInvalidHours: "יש למלא שעות תקינות",
  scheduleServerError: "לא הצלחנו להתחבר לשרת. נסה שוב.",
  hello: "שלום",
  storeHealthTitle: "מד מצב החנות",
  storeHealthPerfect: "הכל מצוין — אין הורדות מהציון",
  inquiryUpdates: "עדכוני פניות",
  noNewInquiries: "אין פניות חדשות",
  inquiriesPending: "פניות ממתינות לתשובה",
  inquiriesAllAnswered: "כל הפניות נענו",
  noInquiriesYet: "אין פניות מלקוחות עדיין.",
  replyRequired: "יש לכתוב תשובה",
  replyToCustomer: "תשובה ללקוח",
  sendReply: "שלח תשובה",
  yourReply: "התשובה שלך",
  customerInquiryLabel: "פניית הלקוח",
  answerCustomer: "ענה ללקוח",
  whatsappPhoneLabel: "מספר וואטסאפ לקבלת התראות",
  whatsappSave: "שמור",
  whatsappTestSend: "שלח הודעת בדיקה",
  whatsappInvalidPhone: "יש להזין מספר וואטסאפ תקין",
  whatsappSaved: "ההגדרות נשמרו",
  whatsappTestOnlyLive: "בדיקת שליחה זמינה רק בחשבון אמיתי מחובר",
  whatsappAria: "התראות וואטסאפ על הזמנות ופניות",
  whatsappIntro:
    "חברו את מספר הוואטסאפ שלכם כדי לקבל הודעה אוטומטית על כל הזמנה חדשה או פנייה מלקוח. המספר הוא זה שבו אתם משתמשים בוואטסאפ (לרוב אותו טלפון נייד).",
  whatsappMetaNote:
    "שליחת הודעות מהאפליקציה דורשת WHATSAPP_ACCESS_TOKEN ו-WHATSAPP_PHONE_NUMBER_ID בשרת (Meta Cloud API). אפשר לשמור מספר והעדפה כבר עכשיו; ההתראות יופעלו אחרי הגדרת המפתחות.",
  whatsappConnect: "חבר וואטסאפ",
  whatsappDisconnect: "נתק וואטסאפ",
  whatsappStatusConnected: "מחובר",
  whatsappStatusDisconnected: "לא מחובר",
  whatsappStatusPhonePending: "יש להזין מספר וואטסאפ",
  whatsappStatusServerPending: "ממתין להגדרת שרת",
  whatsappStatusVerifyPending: "שלחו הודעת בדיקה לאימות",
  whatsappUseAccountPhone: "השתמש במספר החשבון שלי",
  whatsappConnectedHint: "תקבלו הודעת וואטסאפ על כל הזמנה חדשה ופנייה מלקוח",
  whatsappConnectStepPhone: "שמירת מספר",
  whatsappConnectStepVerify: "אימות בוואטסאפ",
  whatsappConnectStepDone: "מחובר",
  faqNoQuestionsYet: "עדיין אין שאלות — הלקוחות יראו הודעה ריקה עד שתוסיף/י.",
  scheduleDemoHint:
    "תצוגת דמו — המתג והבחירות עובדים. לשמירה אמיתית התחבר לדשבורד.",
  schedulePickDaysHint: "לחיצה = יום פתוח · לחיצה כפולה = אות אדומה (סגור להזמנות)",
  periodThreeDays: "3 ימים",
  faqPolicyTitle: "מדיניות החנות",
  faqAddQuestion: "הוספת שאלה",
  savePolicy: "שמור מדיניות",
  question: "שאלה",
  answer: "תשובה",
  addQuestion: "הוסף שאלה",
  policyPlaceholder: "משלוחים, החזרות, אלרגנים, שעות פעילות...",
  questionPlaceholder: "לדוגמה: מה שעות הפעילות?",
  answerPlaceholder: "לדוגמה: א׳–ה׳ 08:00–20:00",
  faqStorePolicy: "מדיניות החנות",
  faqHiddenFromCustomers: "מוסתר מלקוחות",
  confirmDeleteFaq: "למחוק שאלה זו?",
  confirmDeleteDeal: "למחוק את הדיל?",
  productName: "שם",
  productPrice: "מחיר",
  productDescription: "תיאור",
  productDiscount: "הנחה",
  productDiscountAndStock: "הנחה",
  productDiscountPrice: "מחיר בהנחה",
  productDiscountLimit: "הגבלה",
  productMaxDiscount: "מקסימום הנחה",
  productStock: "מלאי",
  productStockUnlimited: "ריק = ללא הגבלה",
  productDiscountRequired: "יש למלא מחיר בהנחה",
  productDiscountBelowPrice: "מחיר ההנחה חייב להיות נמוך מהמחיר הרגיל",
  productMaxDiscountRequired: "יש למלא מקסימום הנחה",
  productStockInvalid: "מלאי חייב להיות מספר שלם (0 ומעלה)",
  productStockRequired: "יש למלא מלאי",
  productImageUpload: "העלאת תמונה",
  productImageUploading: "מעלה…",
  productImageDropHint: "לחץ או גרור לכאן",
  productImagePreviewAlt: "תצוגה מקדימה",
  productImageRemove: "הסר תמונה",
  productImageTypeError: "יש להעלות תמונה בפורמט JPG, PNG, WebP או GIF",
  productImageSizeError: "גודל התמונה המקסימלי הוא 2MB",
  productImageReadError: "שגיאה בקריאת התמונה",
  dealName: "שם הדיל",
  dealPrice: "מחיר דיל",
  dealDate: "תאריך",
  dealFillName: "יש למלא שם דיל",
  dealFillPrice: "יש למלא מחיר תקין",
  dealPickProduct: "יש לבחור לפחות מוצר אחד",
  dealMaxProducts: "ניתן לבחור עד 3 מוצרים בדיל",
  dealPickDate: "יש לבחור תאריך",
  dealDateFuture: "תאריך התוקף חייב להיות בעתיד",
  dealSaveFailed: "שמירה נשחלה",
  periodOneDay: "יום",
  periodOneWeek: "שבוע",
  periodTwoWeeks: "שבועיים",
  periodCustom: "התאמה אישית",
  totalRevenue: "סך המכירות",
  totalProfit: "סך הרווח",
  salesCount: "כמות מכירות",
  salesChartTitle: "כמות המכירות",
  revenueHint: "סכום הזמנות בתקופה",
  profitHint: "הכנסות נטו (ללא הזמנות שבוטלו)",
  ordersCountHint: "מספר הזמנות בתקופה",
  periodWeek: "שבועי",
  periodMonth: "חודשי",
  periodYear: "שנתי",
  sendCustomerMessage: "שלח באפליקציה",
  sendCustomerWhatsApp: "שלח בוואטסאפ",
  periodSummaryWeek: "7 הימים האחרונים",
  periodSummaryMonth: "30 הימים האחרונים",
  periodSummaryYear: "12 החודשים האחרונים",
  ownerAccount: "חשבון בעלים",
  email: "אימייל",
  storeStatus: "סטטוס חנות",
  storeActive: "פעילה — לקוחות יכולים להיכנס",
  storeInactive: "מושבתת",
  storeInactiveHint:
    "לקוחות רואים שהעסק לא זמין. אם זה לא מכוון — פנה למנהל המערכת להפעלה.",
  logoutTitle: "יציאה מהמערכת",
  logoutHint: "סיום העבודה במכשיר זה",
  logout: "התנתקות",
  deleteStoreTitle: "מחיקת חנות",
  deleteStoreButton: "מחק את החנות",
  deleteStoreModalTitle: "האם אתה בטוח?",
  deleteStoreModalBody:
    "פעולה בלתי הפיכה. כל המוצרים, ההזמנות, השאלות הנפוצות והנתונים של החנות יימחקו לצמיתות ולא ניתן לשחזר אותם.",
  deleteStoreModalBodyNamed:
    "פעולה בלתי הפיכה. כל המוצרים, ההזמנות, השאלות והנתונים של «{name}» יימחקו לצמיתות ולא ניתן לשחזר אותם.",
  deleteStoreModalConfirm: "כן, מחק לצמיתות",
  deleteStoreError: "לא ניתן למחוק את החנות כרגע",
  deleteStorePreviewOnly: "בתצוגה מקומית — מחיקה אינה זמינה",
  deleting: "מוחק…",
  helpTextTitle: "טקסט עזר בממשק",
  helpTextDesc: "הסברים ליד כפתורים וקישורים",
  shareStoreLink: "שיתוף קישור",
  storeLinkBarLabel: "קישור החנות",
  copyLink: "העתק קישור",
  copied: "הועתק!",
  alerts: "התראות",
  installApp: "הורדת אפליקציה",
  installAppTitle: "התקינו את Linky במכשיר",
  installAppSubtitle:
    "אותן פונקציות כמו באתר — ניהול חנות, הזמנות, לקוחות ופניות — ישירות מהמסך הראשי.",
  installAppInstalledTitle: "האפליקציה מותקנת",
  installAppInstalledHint: "אפשר לפתוח את Linky מהמסך הראשי בכל עת.",
  installAppButton: "התקנת אפליקציה",
  installAppIosStep1: "לחצו על כפתור השיתוף בתחתית Safari",
  installAppIosStep2: "גללו ובחרו «הוספה למסך הבית»",
  installAppIosStep3: "אשרו — האפליקציה תופיע במסך הבית",
  installAppAndroidHint:
    "ב-Chrome: תפריט (⋮) → «התקן אפליקציה» או «הוסף למסך הבית». אם מופיע כפתור למעלה — לחצו עליו.",
  installAppDesktopHint:
    "במחשב: Chrome/Edge → אייקון ההתקנה בשורת הכתובת. בחנויות: Android/iOS דרך תיקיית mobile בפרויקט.",
  installAppBannerTitle: "התקינו את Linky",
  installAppBannerHint: "גישה מהירה לדשבורד מהמסך הראשי",
  installAppBannerInstall: "התקנה",
  installAppBannerDismiss: "סגירה",
  pushEnableTitle: "התראות דחיפה במכשיר",
  pushEnableHint:
    "לאחר הפעלת ההתראות למעלה, לחצו כאן ואשרו הרשאת התראות בדפדפן. כך תקבלו הודעה גם כשהאפליקציה סגורה (Android / iPhone מותקן למסך הבית).",
  pushSubscribeButton: "הפעלת התראות במכשיר",
  pushSubscribed: "מחובר להתראות דחיפה במכשיר זה",
  pushPermissionDenied:
    "הרשאת התראות נחסמה. אפשר לאפשר בהגדרות הדפדפן / המכשיר ולנסות שוב.",
  pushUnsupported: "הדפדפן או המכשיר לא תומכים בהתראות דחיפה.",
  pushUnconfigured:
    "התראות דחיפה לא מוגדרות בשרת. מפתחות VAPID נדרשים בפרודקשן.",
  pushSubscribeError: "לא הצלחנו להפעיל התראות — נסו שוב.",
  pushPreviewOnly: "בתצוגת דמו אין חיבור להתראות אמיתיות.",
  subscription: "מנוי",
  subscriptionPlansTitle: "חבילות מנוי",
  subscriptionPlansHint: "בחרו את החבילה המתאימה לעסק שלכם",
  subscriptionPremium: "פרימיום",
  subscriptionUltimate: "אולטימייט",
  subscriptionPerMonth: "לחודש",
  subscriptionChoose: "בחירת חבילה",
  subscriptionComingSoon: "תשלום אונליין יתווסף בקרוב",
  subscriptionPreviewOnly: "בתצוגת דמו — בחירת חבילה ללא תשלום",
  subscriptionPremiumFeature1: "חנות מלאה, הזמנות ולקוחות",
  subscriptionPremiumFeature2: "התראות וסטטיסטיקות",
  subscriptionPremiumFeature3: "מבצעים וצ'אט עם לקוחות",
  subscriptionUltimateFeature1: "כל מה שבפרימיום",
  subscriptionUltimateFeature2: "תמיכה מועדפת ועדיפות",
  subscriptionUltimateFeature3: "הרחבות מתקדמות לעסק",
  alertsEnableTitle: "הפעלת התראות",
  alertsEnableHint: "בחרו על אילו אירועים תרצו לקבל התראה",
  alertOnCustomerInquiry: "התראה על פניית לקוח",
  alertOnChatMessage: "התראה על פנייה בצ'אט",
  alertOnNewOrder: "התראה על הזמנה חדשה",
  alertOnLowStock: "התראה כשהמלאי עומד להיגמר",
  customerPreview: "תצוגת לקוח →",
  broadcastMessage: "תוכן ההודעה",
  broadcastPlaceholder: "לדוגמה: מבצע סוף שבוע — 10% על כל המוצרים!",
  sendToAllCustomers: "שלח לכל הלקוחות",
  broadcastWriteMessage: "יש לכתוב הודעה",
  broadcastSentPreview: "ההודעה נשלחה (תצוגה) — הלקוחות יראו התראה",
  broadcastPublished: "ההודעה פורסמה — כל הלקוחות יקבלו התראה בכניסה לחנות",
  broadcastHistory: "היסטוריה",
  broadcastHistoryEmpty: "אין הודעות קודמות",
  anonymousCustomer: "אנונימי",
  noCustomersYet: "אין לקוחות עדיין",
  customerOrderCount: "מספר הזמנות",
  customerLastOrder: "הזמנה אחרונה",
  callCustomer: "התקשר ללקוח",
  customerMessagePlaceholder: "כתוב/י הודעה ללקוח…",
  customerMessageInvalidPhone: "מספר הטלפון לא תקין לשליחה",
  storeDescription: "תיאור החנות",
  storeDescriptionPlaceholder:
    "ספר/י ללקוחות על העסק, שעות, מדיניות משלוח...",
  slotStart: "התחלה",
  slotEnd: "סיום",
  maxOrders: "מקסימום הזמנות",
  price: "מחיר",
  description: "תיאור",
  revenue: "הכנסות",
  trendStable: "→ יציב (+0%)",
  trendUp: "↑ עלייה (+{pct}%)",
  trendDown: "↓ ירידה ({pct}%)",
};

const EN: DashboardLabels = {
  navHome: "Home",
  navActions: "Actions",
  navSeller: "Seller navigation",
  backToStore: "Back to store",
  backToActions: "Back to actions",
  backToCustomers: "Back to customers",
  products: "Products",
  orders: "Orders",
  deals: "Deals",
  limits: "Limits",
  settings: "Settings",
  accountAndLink: "Account & store link",
  extras: "More details",
  customers: "Customers",
  customerMessage: "Message customers",
  customerInquiries: "Customer inquiries",
  sellerChatTitle: "Customer chat",
  sellerChatHint: "Pick a conversation and reply when you can",
  sellerChatEmpty: "No customer chat messages yet",
  sellerChatTabPrivate: "Private chats",
  sellerChatTabCommunity: "Community chat",
  sellerChatBackToList: "All chats",
  chatLoading: "Loading…",
  chatEmpty: "No messages yet",
  chatPlaceholder: "Write a message…",
  chatReply: "Reply",
  replyingTo: "Replying to",
  cancelReply: "Cancel",
  store: "Store",
  faq: "FAQ",
  salesAndProfit: "Sales & profit",
  orderStatsTitle: "Order statistics",
  styleColorLanguage: "Style & language",
  storeLanguageForCustomers: "Store language for customers",
  storeMode: "Display mode",
  hebrew: "Hebrew",
  english: "English",
  back: "Back",
  close: "Close",
  save: "Save",
  cancel: "Cancel",
  confirm: "Confirm",
  send: "Send",
  saved: "Saved",
  saveError: "Could not save",
  networkError: "Network error",
  loadError: "Could not load",
  previewSavedHint: "Saved in preview — sign in and tap Save in the live dashboard",
  activeOrders: "Active orders",
  orderHistory: "History",
  noActiveOrders: "No active orders",
  noOrderHistory: "No orders in history",
  noOrders: "No orders.",
  noOrdersYet: "No orders yet.",
  total: "Total",
  confirmOrder: "Confirm",
  completeOrder: "Mark completed",
  cancelOrder: "Cancel",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  order: "Order",
  unit: "unit",
  units: "units",
  customer: "customer",
  customerJoinDate: "Join date",
  continueToConfirm: "Continue to review",
  confirmBeforeSave: "Confirm before saving",
  confirmAndSave: "Confirm & save",
  backToEdit: "Back to edit",
  addDeal: "Add deal",
  existingDeals: "Existing deals",
  noExistingDeals: "No deals yet",
  closeForm: "Close form",
  saveDeal: "Save deal",
  saving: "Saving...",
  adding: "Adding...",
  sending: "Sending...",
  edit: "Edit",
  delete: "Delete",
  active: "Active",
  inactive: "Inactive",
  hidden: "Hidden",
  show: "Show",
  hide: "Hide",
  enableOrderLimit: "Limit when customers can order",
  orderScheduleLimitTitle: "Order hours & days limit",
  saveOrderSettings: "Save order settings",
  whichDays: "Which days",
  whichHours: "Which hours",
  fromHour: "From",
  toHour: "Until",
  addProduct: "Add product",
  messageSent: "Saved — limits apply to customers",
  dayToggleHint: "Tap — open or closed for orders",
  scheduleNeedOpenDay: "Keep at least one day open for orders",
  scheduleInvalidHours: "Enter valid hours",
  scheduleServerError: "Could not reach the server. Try again.",
  hello: "Hello",
  storeHealthTitle: "Store health",
  storeHealthPerfect: "All good — no score deductions",
  inquiryUpdates: "Inquiry updates",
  noNewInquiries: "No new inquiries",
  inquiriesPending: "inquiries waiting for a reply",
  inquiriesAllAnswered: "All inquiries answered",
  noInquiriesYet: "No customer inquiries yet.",
  replyRequired: "Write a reply",
  replyToCustomer: "Reply to customer",
  sendReply: "Send reply",
  yourReply: "Your reply",
  customerInquiryLabel: "Customer message",
  answerCustomer: "Reply to customer",
  whatsappPhoneLabel: "WhatsApp number for alerts",
  whatsappSave: "Save",
  whatsappTestSend: "Send test message",
  whatsappInvalidPhone: "Enter a valid WhatsApp number",
  whatsappSaved: "Settings saved",
  whatsappTestOnlyLive: "Test send is only available on a signed-in account",
  whatsappAria: "WhatsApp alerts for orders and inquiries",
  whatsappIntro:
    "Add your WhatsApp number to get an automatic message for every new order or customer inquiry. Use the number you use on WhatsApp (usually your mobile).",
  whatsappMetaNote:
    "Sending requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID on the server (Meta Cloud API). Save your number now; alerts go live once keys are set.",
  whatsappConnect: "Connect WhatsApp",
  whatsappDisconnect: "Disconnect WhatsApp",
  whatsappStatusConnected: "Connected",
  whatsappStatusDisconnected: "Not connected",
  whatsappStatusPhonePending: "Enter a WhatsApp number",
  whatsappStatusServerPending: "Waiting for server setup",
  whatsappStatusVerifyPending: "Send a test message to verify",
  whatsappUseAccountPhone: "Use my account phone",
  whatsappConnectedHint: "You will get a WhatsApp alert for every new order and customer inquiry",
  whatsappConnectStepPhone: "Save number",
  whatsappConnectStepVerify: "Verify on WhatsApp",
  whatsappConnectStepDone: "Connected",
  faqNoQuestionsYet:
    "No questions yet — customers will see an empty message until you add some.",
  scheduleDemoHint:
    "Demo preview — toggles work here. Sign in to the live dashboard to save.",
  schedulePickDaysHint: "Tap the day name to close it for orders (row fades)",
  periodThreeDays: "3 days",
  faqPolicyTitle: "Store policy",
  faqAddQuestion: "Add question",
  savePolicy: "Save policy",
  question: "Question",
  answer: "Answer",
  addQuestion: "Add question",
  policyPlaceholder: "Shipping, returns, allergens, hours...",
  questionPlaceholder: "e.g. What are your hours?",
  answerPlaceholder: "e.g. Mon–Fri 8:00 AM–8:00 PM",
  faqStorePolicy: "Store policy",
  faqHiddenFromCustomers: "Hidden from customers",
  confirmDeleteFaq: "Delete this question?",
  confirmDeleteDeal: "Delete this deal?",
  productName: "Name",
  productPrice: "Price",
  productDescription: "Description",
  productDiscount: "Discount",
  productDiscountAndStock: "Discount",
  productDiscountPrice: "Sale price",
  productDiscountLimit: "Limit",
  productMaxDiscount: "Max discount",
  productStock: "Stock",
  productStockUnlimited: "Empty = unlimited",
  productDiscountRequired: "Enter a sale price when limiting the discount",
  productDiscountBelowPrice: "Sale price must be lower than the regular price",
  productMaxDiscountRequired: "Enter a maximum discount",
  productStockInvalid: "Stock must be a whole number (0 or more)",
  productStockRequired: "Enter stock quantity",
  productImageUpload: "Upload image",
  productImageUploading: "Uploading…",
  productImageDropHint: "Click or drag here",
  productImagePreviewAlt: "Preview",
  productImageRemove: "Remove image",
  productImageTypeError: "Use JPG, PNG, WebP, or GIF",
  productImageSizeError: "Maximum image size is 2MB",
  productImageReadError: "Could not read the image",
  dealName: "Deal name",
  dealPrice: "Deal price",
  dealDate: "Date",
  dealFillName: "Enter a deal name",
  dealFillPrice: "Enter a valid price",
  dealPickProduct: "Select at least one product",
  dealMaxProducts: "You can add up to 3 products per deal",
  dealPickDate: "Pick a date",
  dealDateFuture: "Expiry date must be in the future",
  dealSaveFailed: "Could not save",
  periodOneDay: "1 day",
  periodOneWeek: "1 week",
  periodTwoWeeks: "2 weeks",
  periodCustom: "Custom",
  totalRevenue: "Total sales",
  totalProfit: "Total profit",
  salesCount: "Orders count",
  salesChartTitle: "Sales volume",
  revenueHint: "Order total in this period",
  profitHint: "Net revenue (excluding cancelled orders)",
  ordersCountHint: "Number of orders in this period",
  periodWeek: "Weekly",
  periodMonth: "Monthly",
  periodYear: "Yearly",
  sendCustomerMessage: "Send in app",
  sendCustomerWhatsApp: "Send on WhatsApp",
  periodSummaryWeek: "Last 7 days",
  periodSummaryMonth: "Last 30 days",
  periodSummaryYear: "Last 12 months",
  ownerAccount: "Owner account",
  email: "Email",
  storeStatus: "Store status",
  storeActive: "Live — customers can visit",
  storeInactive: "Disabled",
  storeInactiveHint:
    "Customers see the business as unavailable. Contact support if this is unexpected.",
  logoutTitle: "Sign out",
  logoutHint: "End your session on this device",
  logout: "Sign out",
  deleteStoreTitle: "Delete store",
  deleteStoreButton: "Delete store",
  deleteStoreModalTitle: "Are you sure?",
  deleteStoreModalBody:
    "This cannot be undone. All products, orders, FAQs, and store data will be permanently deleted and cannot be recovered.",
  deleteStoreModalBodyNamed:
    "This cannot be undone. All products, orders, FAQs, and data for «{name}» will be permanently deleted and cannot be recovered.",
  deleteStoreModalConfirm: "Yes, delete permanently",
  deleteStoreError: "Could not delete the store",
  deleteStorePreviewOnly: "Preview mode — delete is not available",
  deleting: "Deleting…",
  helpTextTitle: "Interface help text",
  helpTextDesc: "Hints next to buttons and links",
  shareStoreLink: "Share link",
  storeLinkBarLabel: "Store link",
  copyLink: "Copy link",
  copied: "Copied!",
  alerts: "Alerts",
  installApp: "Install app",
  installAppTitle: "Install Linky on your device",
  installAppSubtitle:
    "Same features as the website — store management, orders, customers, and inquiries — from your home screen.",
  installAppInstalledTitle: "App installed",
  installAppInstalledHint: "Open Linky anytime from your home screen.",
  installAppButton: "Install app",
  installAppIosStep1: "Tap the Share button at the bottom of Safari",
  installAppIosStep2: "Scroll and choose “Add to Home Screen”",
  installAppIosStep3: "Confirm — Linky will appear on your home screen",
  installAppAndroidHint:
    "In Chrome: menu (⋮) → “Install app” or “Add to Home screen”. Use the install button if it appears.",
  installAppDesktopHint:
    "On desktop: Chrome/Edge → install icon in the address bar. For app stores, use the mobile/ folder in the project.",
  installAppBannerTitle: "Install Linky",
  installAppBannerHint: "Quick access to your dashboard from the home screen",
  installAppBannerInstall: "Install",
  installAppBannerDismiss: "Dismiss",
  pushEnableTitle: "Push notifications on this device",
  pushEnableHint:
    "After enabling alerts above, tap here and allow notifications in the browser. You’ll get alerts even when the app is closed (Android / iOS home-screen install).",
  pushSubscribeButton: "Enable push on this device",
  pushSubscribed: "Push notifications enabled on this device",
  pushPermissionDenied:
    "Notifications were blocked. Allow them in browser or device settings and try again.",
  pushUnsupported: "This browser or device does not support push notifications.",
  pushUnconfigured: "Push is not configured on the server (VAPID keys required).",
  pushSubscribeError: "Could not enable push — try again.",
  pushPreviewOnly: "Push is not available in preview mode.",
  subscription: "Subscription",
  subscriptionPlansTitle: "Subscription plans",
  subscriptionPlansHint: "Choose the plan that fits your business",
  subscriptionPremium: "Premium",
  subscriptionUltimate: "Ultimate",
  subscriptionPerMonth: "per month",
  subscriptionChoose: "Choose plan",
  subscriptionComingSoon: "Online checkout coming soon",
  subscriptionPreviewOnly: "Preview mode — plan selection without payment",
  subscriptionPremiumFeature1: "Full store, orders & customers",
  subscriptionPremiumFeature2: "Alerts & analytics",
  subscriptionPremiumFeature3: "Deals & customer chat",
  subscriptionUltimateFeature1: "Everything in Premium",
  subscriptionUltimateFeature2: "Priority support",
  subscriptionUltimateFeature3: "Advanced business tools",
  alertsEnableTitle: "Enable alerts",
  alertsEnableHint: "Choose which events should trigger a notification",
  alertOnCustomerInquiry: "Alert on customer inquiry",
  alertOnChatMessage: "Alert on chat message",
  alertOnNewOrder: "Alert on new order",
  alertOnLowStock: "Alert when stock is low",
  customerPreview: "Customer preview →",
  broadcastMessage: "Message",
  broadcastPlaceholder: "e.g. Weekend sale — 10% off everything!",
  sendToAllCustomers: "Send to all customers",
  broadcastWriteMessage: "Write a message",
  broadcastSentPreview: "Sent in preview — customers will see an alert",
  broadcastPublished: "Published — every customer will see it when they open the store",
  broadcastHistory: "History",
  broadcastHistoryEmpty: "No previous messages",
  anonymousCustomer: "Anonymous",
  noCustomersYet: "No customers yet",
  customerOrderCount: "Orders",
  customerLastOrder: "Last order",
  callCustomer: "Call customer",
  customerMessagePlaceholder: "Write a message to this customer…",
  customerMessageInvalidPhone: "Phone number is not valid for messaging",
  storeDescription: "Store description",
  storeDescriptionPlaceholder: "Tell customers about your business, hours, delivery...",
  slotStart: "Start",
  slotEnd: "End",
  maxOrders: "Max orders",
  price: "Price",
  description: "Description",
  revenue: "Revenue",
  trendStable: "→ Stable (+0%)",
  trendUp: "↑ Up (+{pct}%)",
  trendDown: "↓ Down ({pct}%)",
};

export function formatRevenueTrend(
  current: number,
  prior: number,
  labels: DashboardLabels
): string {
  if (prior <= 0) return labels.trendStable;
  const pct = Math.round(((current - prior) / prior) * 100);
  if (pct > 0) return labels.trendUp.replace("{pct}", String(pct));
  if (pct < 0) return labels.trendDown.replace("{pct}", String(Math.abs(pct)));
  return labels.trendStable;
}

export const DASHBOARD_LABELS: Record<AppLocale, DashboardLabels> = {
  he: HE,
  en: EN,
};

export function getOrderDayLabels(locale: AppLocale): readonly string[] {
  return locale === "en"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
}
