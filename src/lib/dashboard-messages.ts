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
  whatsappAlerts: string;
  accountAndLink: string;
  extras: string;
  customers: string;
  customerMessage: string;
  customerInquiries: string;
  store: string;
  faq: string;
  salesAndProfit: string;
  orderStatsTitle: string;
  styleColorLanguage: string;
  stylePanelTitle: string;
  storeLanguageForCustomers: string;
  storeMode: string;
  hebrew: string;
  english: string;
  back: string;
  close: string;
  save: string;
  cancel: string;
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
  continueToConfirm: string;
  confirmBeforeSave: string;
  confirmAndSave: string;
  backToEdit: string;
  addDeal: string;
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
  saveOrderSettings: string;
  whichDays: string;
  whichHours: string;
  fromHour: string;
  toHour: string;
  addProduct: string;
  messageSent: string;
  dayClosedHint: string;
  dayOpenHint: string;
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
  productMaxDiscount: string;
  productStock: string;
  productStockUnlimited: string;
  productDiscountRequired: string;
  productDiscountBelowPrice: string;
  productMaxDiscountRequired: string;
  productStockInvalid: string;
  productImageUpload: string;
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
  deleting: string;
  helpTextTitle: string;
  helpTextDesc: string;
  shareStoreLink: string;
  copyLink: string;
  copied: string;
  customerPreview: string;
  broadcastMessage: string;
  broadcastPlaceholder: string;
  sendToAllCustomers: string;
  broadcastWriteMessage: string;
  broadcastSentPreview: string;
  broadcastPublished: string;
  storeDescription: string;
  storeDescriptionPlaceholder: string;
  slotStart: string;
  slotEnd: string;
  maxOrders: string;
  name: string;
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
  whatsappAlerts: "התראות וואטסאפ",
  accountAndLink: "חשבון וקישור לחנות",
  extras: "פרטים נוספים",
  customers: "לקוחות",
  customerMessage: "הודעה ללקוחות",
  customerInquiries: "פניות לקוחות",
  store: "החנות",
  faq: "שאלות ותשובות",
  salesAndProfit: "מכירות ורווחים",
  orderStatsTitle: "סטטיסטיקת הזמנות",
  styleColorLanguage: "סגנון ושפה לחנות",
  stylePanelTitle: "סגנון ושפה",
  storeLanguageForCustomers: "שפת החנות ללקוחות",
  storeMode: "מצב תצוגה",
  hebrew: "עברית",
  english: "English",
  back: "חזרה",
  close: "סגור",
  save: "שמור",
  cancel: "ביטול",
  send: "שלח",
  saved: "נשמר",
  saveError: "שגיאה בשמירה",
  networkError: "שגיאת רשת",
  loadError: "שגיאה בטעינה",
  previewSavedHint: "נשמר בתצוגה — בדשבורד האמיתי לחץ שמור לאחר ההתחברות",
  activeOrders: "הזמנות פעילות",
  orderHistory: "הסטוריית הזמנות",
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
  continueToConfirm: "המשך לאישור",
  confirmBeforeSave: "אישור לפני שמירה",
  confirmAndSave: "אישור ושמירה",
  backToEdit: "חזרה לעריכה",
  addDeal: "הוסף דיל",
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
  saveOrderSettings: "שמור הגדרות הזמנה",
  whichDays: "איזה ימים",
  whichHours: "איזה שעות",
  fromHour: "משעה",
  toHour: "עד שעה",
  addProduct: "הוסף מוצר",
  messageSent: "נשמר — ההגבלה פעילה ללקוחות",
  dayClosedHint: "יום סגור — לחיצה כפולה לפתיחה",
  dayOpenHint: "לחיצה כפולה לסגירת היום",
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
    "שליחת הודעות מהאפליקציה דורשת חיבור WhatsApp Business בשרת (מפתחות Meta). אפשר לשמור את המספר וההעדפה כבר עכשיו; ההתראות יופעלו כשהמנהל יגדיר את החיבור.",
  faqNoQuestionsYet: "עדיין אין שאלות — הלקוחות יראו הודעה ריקה עד שתוסיף/י.",
  scheduleDemoHint:
    "תצוגת דמו — המתג והבחירות עובדים. לשמירה אמיתית התחבר לדשבורד.",
  schedulePickDaysHint: "בחר ימים ושעות, ואז לחץ שמור",
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
  productMaxDiscount: "מקסימום הנחה",
  productStock: "מלאי",
  productStockUnlimited: "ריק = ללא הגבלה",
  productDiscountRequired: "יש למלא מחיר הנחה כשמגבילים את גובה ההנחה",
  productDiscountBelowPrice: "מחיר ההנחה חייב להיות נמוך מהמחיר הרגיל",
  productMaxDiscountRequired: "יש למלא מקסימום הנחה",
  productStockInvalid: "מלאי חייב להיות מספר שלם (0 ומעלה)",
  productImageUpload: "העלאת תמונה",
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
  copyLink: "העתק קישור",
  copied: "הועתק!",
  customerPreview: "תצוגת לקוח →",
  broadcastMessage: "תוכן ההודעה",
  broadcastPlaceholder: "לדוגמה: מבצע סוף שבוע — 10% על כל המוצרים!",
  sendToAllCustomers: "שלח לכל הלקוחות",
  broadcastWriteMessage: "יש לכתוב הודעה",
  broadcastSentPreview: "ההודעה נשלחה (תצוגה) — הלקוחות יראו התראה",
  broadcastPublished: "ההודעה פורסמה — כל הלקוחות יקבלו התראה בכניסה לחנות",
  storeDescription: "תיאור החנות",
  storeDescriptionPlaceholder:
    "ספר/י ללקוחות על העסק, שעות, מדיניות משלוח...",
  slotStart: "התחלה",
  slotEnd: "סיום",
  maxOrders: "מקסימום הזמנות",
  name: "שם",
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
  whatsappAlerts: "WhatsApp alerts",
  accountAndLink: "Account & store link",
  extras: "More details",
  customers: "Customers",
  customerMessage: "Message customers",
  customerInquiries: "Customer inquiries",
  store: "Store",
  faq: "FAQ",
  salesAndProfit: "Sales & profit",
  orderStatsTitle: "Order statistics",
  styleColorLanguage: "Style & language",
  stylePanelTitle: "Style & language",
  storeLanguageForCustomers: "Store language for customers",
  storeMode: "Display mode",
  hebrew: "Hebrew",
  english: "English",
  back: "Back",
  close: "Close",
  save: "Save",
  cancel: "Cancel",
  send: "Send",
  saved: "Saved",
  saveError: "Could not save",
  networkError: "Network error",
  loadError: "Could not load",
  previewSavedHint: "Saved in preview — sign in and tap Save in the live dashboard",
  activeOrders: "Active orders",
  orderHistory: "Order history",
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
  continueToConfirm: "Continue to review",
  confirmBeforeSave: "Confirm before saving",
  confirmAndSave: "Confirm & save",
  backToEdit: "Back to edit",
  addDeal: "Add deal",
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
  saveOrderSettings: "Save order settings",
  whichDays: "Which days",
  whichHours: "Which hours",
  fromHour: "From",
  toHour: "Until",
  addProduct: "Add product",
  messageSent: "Saved — limits apply to customers",
  dayClosedHint: "Day closed — double-click to open",
  dayOpenHint: "Double-click to close this day",
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
    "Sending from the app requires WhatsApp Business API on the server (Meta keys). You can save your number and preference now; alerts go live once the connection is configured.",
  faqNoQuestionsYet:
    "No questions yet — customers will see an empty message until you add some.",
  scheduleDemoHint:
    "Demo preview — toggles work here. Sign in to the live dashboard to save.",
  schedulePickDaysHint: "Pick days and hours, then tap Save",
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
  productMaxDiscount: "Max discount",
  productStock: "Stock",
  productStockUnlimited: "Empty = unlimited",
  productDiscountRequired: "Enter a sale price when limiting the discount",
  productDiscountBelowPrice: "Sale price must be lower than the regular price",
  productMaxDiscountRequired: "Enter a maximum discount",
  productStockInvalid: "Stock must be a whole number (0 or more)",
  productImageUpload: "Upload image",
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
  copyLink: "Copy link",
  copied: "Copied!",
  customerPreview: "Customer preview →",
  broadcastMessage: "Message",
  broadcastPlaceholder: "e.g. Weekend sale — 10% off everything!",
  sendToAllCustomers: "Send to all customers",
  broadcastWriteMessage: "Write a message",
  broadcastSentPreview: "Sent in preview — customers will see an alert",
  broadcastPublished: "Published — every customer will see it when they open the store",
  storeDescription: "Store description",
  storeDescriptionPlaceholder: "Tell customers about your business, hours, delivery...",
  slotStart: "Start",
  slotEnd: "End",
  maxOrders: "Max orders",
  name: "Name",
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
