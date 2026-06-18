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
  dealsAndLimits: string;
  services: string;
  appointments: string;
  appointmentSlots: string;
  appointmentCalendar: string;
  appointmentCalendarAndLimits: string;
  appointmentGapMinutes: string;
  appointmentGapBetweenMeetings: string;
  appointmentDurationMinutes: string;
  appointmentBookingHours: string;
  appointmentBookingFrom: string;
  appointmentBookingUntil: string;
  saveAppointmentCalendar: string;
  appointmentCalendarSaved: string;
  workingDays: string;
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
  platformOwnerMessageTitle: string;
  platformOwnerMessageGotIt: string;
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
  trialExpiredTitle: string;
  trialExpiredHint: string;
  trialExpiredEndedOn: string;
  subscriptionPayMonthly: string;
  subscriptionStatusTitle: string;
  subscriptionActivePlan: string;
  subscriptionTrialRemaining: string;
  subscriptionRenewsOn: string;
  subscriptionUsageThisMonth: string;
  subscriptionUsageOf: string;
  subscriptionManageBilling: string;
  subscriptionNoBillingYet: string;
  subscriptionPortalError: string;
  subscriptionTrialExpiredShort: string;
  alertsEnableTitle: string;
  alertsEnableHint: string;
  alertOnCustomerInquiry: string;
  alertOnChatMessage: string;
  alertOnNewOrder: string;
  alertOnLowStock: string;
  alertOnNewAppointment: string;
  alertOnAllSlotsFull: string;
  notificationTitle: string;
  notificationEmpty: string;
  notificationTypeInquiry: string;
  notificationTypeChat: string;
  notificationTypeOrder: string;
  notificationTypeAppointment: string;
  notificationTypeLowStock: string;
  notificationBackToList: string;
  notificationOpenOrders: string;
  notificationOpenAppointments: string;
  notificationOpenProducts: string;
  notificationStockOut: string;
  notificationStockLeft: string;
  accountAndLink: string;
  storePanelsTitle: string;
  storePanelDeals: string;
  storePanelBroadcast: string;
  storePanelChat: string;
  storePanelInquiries: string;
  storePanelFaq: string;
  storePanelOrderLimits: string;
  storePanelsSaveFailed: string;
  extras: string;
  customers: string;
  customerMessage: string;
  customerInquiries: string;
  customerInquiriesChat: string;
  customerInquiriesInbox: string;
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
  activeAppointments: string;
  appointmentHistory: string;
  noActiveOrders: string;
  noOrderHistory: string;
  noActiveAppointments: string;
  noAppointmentHistory: string;
  noOrders: string;
  noOrdersYet: string;
  total: string;
  prepSummaryButton: string;
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
  addNewDeal: string;
  existingDeals: string;
  dealOff: string;
  noExistingDeals: string;
  closeForm: string;
  saveDeal: string;
  saving: string;
  adding: string;
  sending: string;
  edit: string;
  delete: string;
  active: string;
  status: string;
  inactive: string;
  hidden: string;
  show: string;
  hide: string;
  enableOrderLimit: string;
  orderScheduleLimitTitle: string;
  appointmentCancelLimitTitle: string;
  appointmentCancelUnitLabel: string;
  appointmentCancelByHours: string;
  appointmentCancelByDays: string;
  appointmentCancelHoursBefore: string;
  appointmentCancelDaysBefore: string;
  saveAppointmentCancelSettings: string;
  appointmentCancelSaved: string;
  saveWorkingDaysSettings: string;
  workingDayToggleHint: string;
  workingDaysNeedOpenDay: string;
  workingDaysPickHint: string;
  homeCalendarPrevMonth: string;
  homeCalendarNextMonth: string;
  homeCalendarFullDayHint: string;
  homeCalendarDayTitle: string;
  homeCalendarNoAppointmentsDay: string;
  homeCalendarBookedAppointments: string;
  homeCalendarOpenAppointments: string;
  homeCalendarDaySlots: string;
  homeCalendarNoSlotsDay: string;
  homeCalendarSlotOpen: string;
  homeCalendarSlotFull: string;
  homeUpcomingAppointments: string;
  homeNoUpcomingAppointments: string;
  homeUpcomingRentals: string;
  homeNoUpcomingRentals: string;
  rentalNight: string;
  rentalNights: string;
  rentalDay: string;
  rentalDays: string;
  homeOpenCalendar: string;
  homeCalendarTitle: string;
  homeCalendarQuickBook: string;
  homeCalendarHistoryHint: string;
  sellerWalkInCustomer: string;
  sellerSelfBooking: string;
  appointmentSlotTime: string;
  appointmentToday: string;
  appointmentTomorrow: string;
  appointmentService: string;
  appointmentCustomerNote: string;
  openCustomerDetails: string;
  appointmentPending: string;
  appointmentConfirmed: string;
  appointmentCancelled: string;
  saveOrderSettings: string;
  whichDays: string;
  whichHours: string;
  fromHour: string;
  toHour: string;
  addProduct: string;
  addService: string;
  noProductsYet: string;
  noServicesYet: string;
  productAddedTitle: string;
  productAddedDetail: string;
  serviceAddedTitle: string;
  serviceAddedDetail: string;
  serviceDurationMinutes: string;
  serviceDurationRequired: string;
  appointmentBookingByDay: string;
  appointmentBookingByDayHint: string;
  appointmentCalendarUpdated: string;
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
  customerMarkedResolved: string;
  customerMarkedNotResolved: string;
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
  faqPublishedTitle: string;
  faqPublishedDetail: string;
  celebrationOk: string;
  comingSoon: string;
  sellerGuideTitle: string;
  sellerGuidePurpose: string;
  sellerGuidePurposeAppointments: string;
  sellerGuideIntro: string;
  sellerGuideIntroAppointments: string;
  sellerGuideStepNavTitle: string;
  sellerGuideStepNavBody: string;
  sellerGuideStepNavBodyAppointments: string;
  sellerGuideStepHomeCalendarTitle: string;
  sellerGuideStepHomeCalendarBody: string;
  sellerGuideCalendarTapHint: string;
  sellerGuideStepActionsTitle: string;
  sellerGuideStepActionsBody: string;
  sellerGuideStepCustomersTitle: string;
  sellerGuideStepCustomersBody: string;
  sellerGuideStepStoreTitle: string;
  sellerGuideStepStoreTitleAppointments: string;
  sellerGuideStepStoreBody: string;
  sellerGuideStepStoreAppointmentsBody: string;
  sellerGuideStepLinkTitle: string;
  sellerGuideStepLinkTitleAppointments: string;
  sellerGuideStepLinkBody: string;
  sellerGuideStepLinkBodyAppointments: string;
  sellerGuideStepDoneTitle: string;
  sellerGuideStepDoneBody: string;
  sellerGuideStepDoneAppointmentsBody: string;
  sellerGuidePath: string;
  sellerGuideSkip: string;
  sellerGuideNext: string;
  sellerGuideBack: string;
  sellerGuideFinish: string;
  sellerGuideAddProduct: string;
  sellerGuideAddService: string;
  sellerGuideAddCalendar: string;
  sellerGuideStepCounter: string;
  appointmentStoreSetupTitle: string;
  appointmentStoreSetupIntro: string;
  appointmentStoreSetupContinue: string;
  sellerGuideWelcomeTipAddProductTitle: string;
  sellerGuideWelcomeTipAddProductBody: string;
  sellerGuideWelcomeTipOrdersTitle: string;
  sellerGuideWelcomeTipOrdersBody: string;
  sellerGuideWelcomeTipCustomersTitle: string;
  sellerGuideWelcomeTipCustomersBody: string;
  sellerGuideWelcomeTipAddServiceTitle: string;
  sellerGuideWelcomeTipAddServiceBody: string;
  sellerGuideWelcomeTipCalendarTitle: string;
  sellerGuideWelcomeTipCalendarBody: string;
  sellerGuideWelcomeTipBookedAppointmentsTitle: string;
  sellerGuideWelcomeTipBookedAppointmentsBody: string;
  sellerGuideWelcomeTipDurationGapTitle: string;
  sellerGuideWelcomeTipDurationGapBody: string;
  sellerGuideWelcomeTipDealsTitle: string;
  sellerGuideWelcomeTipDealsBody: string;
  sellerGuideWelcomeTipLimitsTitle: string;
  sellerGuideWelcomeTipLimitsBody: string;
  sellerGuideReplayTitle: string;
  sellerGuideReplayBody: string;
  sellerGuideReplayAction: string;
  liveTourIntroTitle: string;
  liveTourIntroBody: string;
  liveTourIntroTitleAppointments: string;
  liveTourIntroBodyAppointments: string;
  liveTourStart: string;
  liveTourNavActionsTitle: string;
  liveTourNavActionsBody: string;
  liveTourHubStoreTitle: string;
  liveTourHubStoreBody: string;
  liveTourHubStoreAppointmentsBody: string;
  liveTourHubProductsTitle: string;
  liveTourHubProductsBody: string;
  liveTourHubServicesTitle: string;
  liveTourHubServicesBody: string;
  liveTourAddProductTitle: string;
  liveTourAddProductBody: string;
  liveTourAddServiceTitle: string;
  liveTourAddServiceBody: string;
  liveTourProductNameTitle: string;
  liveTourProductNameBody: string;
  liveTourProductPriceTitle: string;
  liveTourProductPriceBody: string;
  liveTourProductSubmitTitle: string;
  liveTourProductSubmitBody: string;
  liveTourServiceNameTitle: string;
  liveTourServiceNameBody: string;
  liveTourServicePriceTitle: string;
  liveTourServicePriceBody: string;
  liveTourServiceSubmitTitle: string;
  liveTourServiceSubmitBody: string;
  liveTourCompleteTitle: string;
  liveTourCompleteBody: string;
  liveTourCompleteBodyAppointments: string;
  liveTourTapHighlight: string;
  liveTourFillHighlight: string;
  liveTourSaveHighlight: string;
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
  productStockRemaining: string;
  productStockUnlimitedList: string;
  productStockLow: string;
  productStockEdit: string;
  productImageUpload: string;
  productImageUploading: string;
  productImageDropHint: string;
  productImagePreviewAlt: string;
  productImageRemove: string;
  productImageTypeError: string;
  productImageSizeError: string;
  productImageReadError: string;
  productImageCropTitle: string;
  productImageCropHint: string;
  productImageCropConfirm: string;
  productImageCropZoom: string;
  productImageEdit: string;
  productImageReplace: string;
  productImagesHint: string;
  productImagesLimit: string;
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
  dealPublishedSuccess: string;
  dealNoActiveProducts: string;
  dealImage: string;
  dealRedemptionLimit: string;
  dealRedemptionOnce: string;
  dealRedemptionUnlimited: string;
  dealRedemptionLimited: string;
  dealRedemptionTimes: string;
  dealRedemptionCountLabel: string;
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
  sellerDetails: string;
  accountDetails: string;
  email: string;
  phone: string;
  phoneNotSet: string;
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
  viewCustomerSide: string;
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
  openCustomerMessageComposer: string;
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
  dealsAndLimits: "דילים והגבלות",
  services: "שירותים",
  appointments: "תורים",
  appointmentSlots: "משבצות תורים",
  appointmentCalendar: "יומן",
  appointmentCalendarAndLimits: "יומן והגבלות",
  appointmentGapMinutes: "רווח בין פגישות (דקות)",
  appointmentGapBetweenMeetings: "רווח בין כל פגישה",
  appointmentDurationMinutes: "משך כל פגישה (דקות)",
  appointmentBookingHours: "שעות לקביעת תורים",
  appointmentBookingFrom: "משעה",
  appointmentBookingUntil: "עד שעה",
  saveAppointmentCalendar: "שמור ועדכן יומן",
  appointmentCalendarSaved: "נשמר — היומן עודכן אוטומטית",
  workingDays: "ימי עבודה",
  settings: "הגדרות",
  accountAndLink: "חשבון וחנות",
  storePanelsTitle: "מה יופיע באתר הלקוחות",
  storePanelDeals: "מבצעים",
  storePanelBroadcast: "הודעות והתראות ללקוחות",
  storePanelChat: "פנייה בוואטסאפ",
  storePanelInquiries: "פניות",
  storePanelFaq: "שאלות נפוצות",
  storePanelOrderLimits: "הגבלות הזמנה",
  storePanelsSaveFailed: "שמירת ההגדרות נכשלה",
  extras: "פרטים נוספים",
  customers: "לקוחות",
  customerMessage: "הודעה ללקוחות",
  customerInquiries: "פניות לקוחות",
  customerInquiriesChat: "צ'אט",
  customerInquiriesInbox: "פניות",
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
  activeAppointments: "תורים",
  appointmentHistory: "היסטוריית תורים",
  noActiveOrders: "אין הזמנות פעילות",
  noOrderHistory: "אין הזמנות בהיסטוריה",
  noActiveAppointments: "אין תורים פעילים",
  noAppointmentHistory: "אין תורים בהיסטוריה",
  noOrders: "אין הזמנות.",
  noOrdersYet: "אין הזמנות עדיין.",
  total: "סה״כ",
  prepSummaryButton: "סיכום",
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
  addNewDeal: "הוסף דיל חדש",
  existingDeals: "דילים קיימים",
  dealOff: "כבוי",
  noExistingDeals: "אין דילים עדיין",
  closeForm: "סגור טופס",
  saveDeal: "שמור דיל",
  saving: "שומר...",
  adding: "מוסיף...",
  sending: "שולח...",
  edit: "ערוך",
  delete: "מחק",
  active: "פעיל",
  status: "מצב",
  inactive: "מושבת",
  hidden: "מוסתר",
  show: "הצג",
  hide: "הסתר",
  enableOrderLimit: "הגבל מתי לקוחות יכולים להזמין",
  orderScheduleLimitTitle: "הגבלת שעות וימי הזמנה",
  appointmentCancelLimitTitle: "עד מתי אפשר לבטל תור",
  appointmentCancelUnitLabel: "בחרו לפי שעות או ימים לפני התור",
  appointmentCancelByHours: "שעות לפני",
  appointmentCancelByDays: "ימים לפני",
  appointmentCancelHoursBefore: "כמה שעות לפני התור",
  appointmentCancelDaysBefore: "כמה ימים לפני התור",
  saveAppointmentCancelSettings: "שמור מדיניות ביטול",
  appointmentCancelSaved: "נשמר — מדיניות הביטול פעילה ללקוחות",
  saveWorkingDaysSettings: "שמור ימי עבודה",
  workingDayToggleHint: "לחיצה — פתוח/סגור לתורים",
  workingDaysNeedOpenDay: "יש להשאיר לפחות יום אחד פתוח לתורים",
  workingDaysPickHint: "לחיצה על שם היום — פתוח או סגור לתורים",
  homeCalendarPrevMonth: "חודש קודם",
  homeCalendarNextMonth: "חודש הבא",
  homeCalendarFullDayHint: "יום מלא — כל התורים נתפסו",
  homeCalendarDayTitle: "תורים ביום",
  homeCalendarNoAppointmentsDay: "אין תורים ביום זה",
  homeCalendarBookedAppointments: "תורים תפוסים",
  homeCalendarOpenAppointments: "תורים פנויים",
  homeCalendarDaySlots: "שעות ביומן",
  homeCalendarNoSlotsDay: "אין שעות ביום זה",
  homeCalendarSlotOpen: "פנוי",
  homeCalendarSlotFull: "מלא",
  homeUpcomingAppointments: "פגישות קרובות",
  homeNoUpcomingAppointments: "אין פגישות קרובות",
  homeUpcomingRentals: "השכרות קרובות",
  homeNoUpcomingRentals: "אין השכרות קרובות",
  rentalNight: "לילה",
  rentalNights: "לילות",
  rentalDay: "יום",
  rentalDays: "ימים",
  homeOpenCalendar: "פתיחת יומן",
  homeCalendarTitle: "יומן",
  homeCalendarQuickBook: "שבץ תור",
  homeCalendarHistoryHint:
    "לעבר רחוק יותר — עברו לחודשים קודמים ובחרו יום ביומן.",
  sellerWalkInCustomer: "לקוח",
  sellerSelfBooking: "שיבוץ מוכר",
  appointmentSlotTime: "שעת הפגישה",
  appointmentToday: "היום",
  appointmentTomorrow: "מחר",
  appointmentService: "שירות",
  appointmentCustomerNote: "הערה",
  openCustomerDetails: "פתיחת פרטי לקוח",
  appointmentPending: "ממתין לאישור",
  appointmentConfirmed: "אושר",
  appointmentCancelled: "בוטל",
  saveOrderSettings: "שמור הגדרות הזמנה",
  whichDays: "איזה ימים",
  whichHours: "איזה שעות",
  fromHour: "משעה",
  toHour: "עד שעה",
  addProduct: "הוסף מוצר",
  addService: "הוסף שירות",
  noProductsYet: "אין מוצרים עדיין",
  noServicesYet: "אין שירותים עדיין",
  productAddedTitle: "המוצר נוסף בהצלחה!",
  productAddedDetail: "הלקוחות יכולים לראות אותו בעמוד החנות",
  serviceAddedTitle: "השירות נוסף בהצלחה!",
  serviceAddedDetail: "הלקוחות יוכלו לבחור אותו בקביעת תור",
  serviceDurationMinutes: "משך השירות (דקות)",
  serviceDurationRequired: "יש להזין משך שירות (לפחות 15 דקות)",
  appointmentBookingByDay: "הזמנה לפי ימים בלבד",
  appointmentBookingByDayHint: "הלקוח יבחר יום בלבד — בלי שעות. הקיבולת ביומן מתעדכנת אוטומטית.",
  appointmentCalendarUpdated: "היומן עודכן",
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
  customerMarkedResolved: "הלקוח: הבעיה נפתרה",
  customerMarkedNotResolved: "הלקוח: הבעיה עדיין לא נפתרה",
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
  faqPublishedTitle: "השאלה פורסמה בהצלחה!",
  faqPublishedDetail: "הלקוחות יראו אותה בעמוד החנות",
  celebrationOk: "מעולה",
  comingSoon: "בקרוב",
  sellerGuideTitle: "מדריך קצר — בוא נתחיל!",
  sellerGuidePurpose:
    "לינקי נותן לך חנות לקבל הזמנות. הכל מגיע מסודר בתור — אתה רואה, מסכם ומאשר. אתה קובע מתי אפשר להזמין וכמה. ללקוח — הכל ברור ונוח, כולל דילים.",
  sellerGuidePurposeAppointments:
    "לינקי נותן לך מקום לקבוע פגישות. הכל מגיע מסודר בתור — אתה רואה, מסכם ומאשר. אתה קובע מתי אפשר לקבוע וכמה. ללקוח — הכל ברור ונוח, כולל דילים.",
  sellerGuideIntro:
    "חמישה דברים פשוטים. ככה מנהלים את החנות — קרא בקצרה:",
  sellerGuideIntroAppointments:
    "חמישה דברים (+ בונוס). ככה מנהלים עסק תורים — קראו בקצרה:",
  sellerGuideStepNavTitle: "1. הניווט בתחתית המסך",
  sellerGuideStepNavBody:
    "יש שני כפתורים קבועים: בית — סיכום יומי וקישור ללקוחות. פעולות — כל ניהול העסק.",
  sellerGuideStepNavBodyAppointments:
    "יש שני כפתורים קבועים: בית — יומן התורים וקישור ללקוחות. פעולות — הגדרות העסק ותקשורת.",
  sellerGuideStepHomeCalendarTitle: "2. יומן התורים בבית",
  sellerGuideStepHomeCalendarBody:
    "בבית תראה יומן חודשי עם הימים שפתוחים לקביעה. לחץ על יום כדי לראות את כל הפגישות באותו יום.",
  sellerGuideCalendarTapHint: "לחץ על יום לצפייה בפגישות",
  sellerGuideStepActionsTitle: "2. מסך הפעולות",
  sellerGuideStepActionsBody:
    "לחץ פעולות בתחתית. שם תמצא שני ריבועים גדולים — לקוחות והחנות. זה מרכז השליטה שלך.",
  sellerGuideStepCustomersTitle: "3. לקוחות",
  sellerGuideStepCustomersBody:
    "בפעולות לחץ לקוחות. שם מטפלים בפניות, צ'אט, הודעות לכל הלקוחות ושאלות נפוצות.",
  sellerGuideStepStoreTitle: "4. החנות",
  sellerGuideStepStoreTitleAppointments: "5. הגדרות העסק",
  sellerGuideStepStoreBody:
    "בפעולות לחץ החנות. שם מוסיפים מוצרים, עוקבים אחרי הזמנות, מגדירים דילים והגבלות.",
  sellerGuideStepStoreAppointmentsBody:
    "בפעולות לחץ החנות. שם מגדירים שירותים, הגדרות תורים, יומן ומשבצות, והגבלות.",
  sellerGuideStepLinkTitle: "5. קישור ללקוחות",
  sellerGuideStepLinkTitleAppointments: "6. קישור ללקוחות",
  sellerGuideStepLinkBody:
    "חזור לבית (בתחתית). העתק או שתף את קישור החנות — זה מה שלקוחות פותחים כדי להזמין.",
  sellerGuideStepLinkBodyAppointments:
    "חזור לבית (בתחתית). העתק או שתף את הקישור — הלקוחות פותחים אותו כדי לקבוע תור.",
  sellerGuideStepDoneTitle: "מוכנים להתחיל!",
  sellerGuideStepDoneBody:
    "הצעד הראשון: הוסף לפחות מוצר אחד עם תמונה ומחיר. אחר כך שתף את הקישור.",
  sellerGuideStepDoneAppointmentsBody:
    "הצעד הראשון: הוסף שירות אחד לפחות והגדר משבצות תורים. אחר כך שתף את הקישור.",
  sellerGuidePath: "מסלול",
  sellerGuideSkip: "דלג",
  sellerGuideNext: "הבא",
  sellerGuideBack: "חזרה",
  sellerGuideFinish: "יופי, הבנתי!",
  sellerGuideAddProduct: "הוסף מוצר ראשון",
  sellerGuideAddService: "הוסף שירות ראשון",
  sellerGuideAddCalendar: "הגדר יומן ומשבצות",
  appointmentStoreSetupTitle: "ימי עבודה ושעות פעילות",
  appointmentStoreSetupIntro:
    "לפני שמתחילים — בחרו באילו ימים ושעות לקוחות יוכלו לקבוע תור, ושמרו. בלי זה היומן יישאר ריק.",
  appointmentStoreSetupContinue: "המשך לסיור בלינקי",
  sellerGuideStepCounter: "שלב {current} מתוך {total}",
  sellerGuideWelcomeTipAddProductTitle: "איך מוסיפים מוצר?",
  sellerGuideWelcomeTipAddProductBody:
    "למטה לוחצים פעולות ← חנות ← מוצרים ← הוסף מוצר. שמים שם, מחיר ותמונה — ושומרים.",
  sellerGuideWelcomeTipOrdersTitle: "איפה רואים הזמנות ומאשרים?",
  sellerGuideWelcomeTipOrdersBody:
    "פעולות ← חנות ← הזמנות. לוחצים על שם הלקוח, רואים מה הוא קנה, ולוחצים אשר.",
  sellerGuideWelcomeTipCustomersTitle: "איך מדברים עם לקוחות?",
  sellerGuideWelcomeTipCustomersBody:
    "פעולות ← לקוחות ← פניות לקוחות. שם צ'אט ופניות — פותחים שיחה ועונים.",
  sellerGuideWelcomeTipAddServiceTitle: "איך ממלאים שירות?",
  sellerGuideWelcomeTipAddServiceBody:
    "פעולות ← חנות ← שירותים ← הוסף שירות. ממלאים שם, מחיר ומשך השירות בדקות — ושומרים.",
  sellerGuideWelcomeTipBookedAppointmentsTitle: "איפה רואים תורים שנקבעו?",
  sellerGuideWelcomeTipBookedAppointmentsBody:
    "בבית תחת «פגישות קרובות». גם בפעולות ← חנות ← תורים — שם כל התורים הפעילים, ו«היסטוריית תורים» לעבר.",
  sellerGuideWelcomeTipCalendarTitle: "איפה היומן?",
  sellerGuideWelcomeTipCalendarBody:
    "בבית — יומן חודשי עם ימים פתוחים לקביעה. לוחצים על יום לראות פגישות באותו יום, או «פתיחת יומן» לתצוגה מלאה.",
  sellerGuideWelcomeTipDurationGapTitle: "בונוס: משך שירות ורווח בין פגישות",
  sellerGuideWelcomeTipDurationGapBody:
    "משך לכל שירות — בשדה «משך השירות» כשמוסיפים שירות. רווח בין פגישות ושעות קביעה: פעולות ← חנות ← יומן.",
  sellerGuideWelcomeTipDealsTitle: "איך מוסיפים דיל?",
  sellerGuideWelcomeTipDealsBody:
    "פעולות ← חנות ← דילים והגבלות ← דילים ← הוסף דיל. בוחרים מוצרים, מחיר ותוקף — ומפרסמים.",
  sellerGuideWelcomeTipLimitsTitle: "איך מגדירים הגבלות?",
  sellerGuideWelcomeTipLimitsBody:
    "פעולות ← חנות ← דילים והגבלות ← הגבלות. מגדירים שעות וימים שבהם הלקוחות יכולים להזמין.",
  sellerGuideReplayTitle: "מדריך התחלה",
  sellerGuideReplayBody: "רוצה לעבור שוב על השלבים הראשונים בלינקי?",
  sellerGuideReplayAction: "הפעל מדריך שוב",
  liveTourIntroTitle: "בואו נוסיף את המוצר הראשון",
  liveTourIntroBody:
    "נסיור קצר על המסך האמיתי — נלווה אותך שלב-אחר-שלב עד שהמוצר נשמר בחנות.",
  liveTourIntroTitleAppointments: "בואו נוסיף את השירות הראשון",
  liveTourIntroBodyAppointments:
    "נסיור קצר על המסך האמיתי — נלווה אותך עד שהשירות נשמר בעסק.",
  liveTourStart: "התחילו סיור מודרך",
  liveTourNavActionsTitle: "לחצו «פעולות»",
  liveTourNavActionsBody: "בתחתית המסך — כאן נכנסים לכל ניהול העסק.",
  liveTourHubStoreTitle: "לחצו «החנות»",
  liveTourHubStoreBody: "כאן מגדירים מוצרים, הזמנות, דילים והגבלות.",
  liveTourHubStoreAppointmentsBody: "כאן מגדירים שירותים, תורים, יומן והגבלות.",
  liveTourHubProductsTitle: "לחצו «מוצרים»",
  liveTourHubProductsBody: "נכנסים לרשימת המוצרים ולהוספת מוצר חדש.",
  liveTourHubServicesTitle: "לחצו «שירותים»",
  liveTourHubServicesBody: "נכנסים להגדרת השירותים שאפשר לקבוע אליהם תור.",
  liveTourAddProductTitle: "לחצו «הוסף מוצר»",
  liveTourAddProductBody: "נפתח טופס — ממלאים יחד את הפרטים הבאים.",
  liveTourAddServiceTitle: "לחצו «הוסף שירות»",
  liveTourAddServiceBody: "נפתח טופס — ממלאים יחד את פרטי השירות.",
  liveTourProductNameTitle: "שם המוצר",
  liveTourProductNameBody: "הקלידו שם — לדוגמה: עוגת שוקולד, לחם מחמצת…",
  liveTourProductPriceTitle: "מחיר",
  liveTourProductPriceBody: "הקלידו מחיר בשקלים (לדוגמה: 45).",
  liveTourProductSubmitTitle: "שמירת המוצר",
  liveTourProductSubmitBody: "לחצו שוב על «הוסף מוצר» בתחתית הטופס כדי לשמור.",
  liveTourServiceNameTitle: "שם השירות",
  liveTourServiceNameBody: "הקלידו שם — לדוגמה: ייעוץ, תספורת, פגישת היכרות…",
  liveTourServicePriceTitle: "מחיר השירות",
  liveTourServicePriceBody: "הקלידו מחיר בשקלים.",
  liveTourServiceSubmitTitle: "שמירת השירות",
  liveTourServiceSubmitBody: "לחצו «הוסף שירות» בתחתית הטופס כדי לשמור.",
  liveTourCompleteTitle: "מעולה — המוצר נוסף!",
  liveTourCompleteBody: "המוצר הראשון בחנות. עכשיו אפשר לשתף את הקישור ללקוחות ממסך הבית.",
  liveTourCompleteBodyAppointments:
    "השירות הראשון מוכן. עכשיו הגדירו משבצות ביומן ושתפו את הקישור.",
  liveTourTapHighlight: "לחצו על האזור המודגש",
  liveTourFillHighlight: "מלאו בשדה המודגש",
  liveTourSaveHighlight: "שמרו בלחיצה על הכפתור המודגש",
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
  productStockRemaining: "נשארו: {n}",
  productStockUnlimitedList: "ללא הגבלת מלאי",
  productStockLow: "מלאי נמוך",
  productStockEdit: "עדכון מלאי",
  productImageUpload: "העלאת תמונה",
  productImageUploading: "מעלה…",
  productImageDropHint: "לחץ או גרור — ואז גזור לריבוע",
  productImagePreviewAlt: "תצוגה מקדימה",
  productImageRemove: "הסר תמונה",
  productImageTypeError: "יש להעלות תמונה בפורמט JPG, PNG, WebP או GIF",
  productImageSizeError: "גודל התמונה המקסימלי הוא 2MB",
  productImageReadError: "שגיאה בקריאת התמונה",
  productImageCropTitle: "גזירת תמונה",
  productImageCropHint: "גרור וזום כדי להתאים לריבוע בחנות",
  productImageCropConfirm: "שמירה",
  productImageCropZoom: "זום",
  productImageEdit: "עריכת תמונה",
  productImageReplace: "החלפה",
  productImagesHint: "עד 4 תמונות",
  productImagesLimit: "ניתן להוסיף עד 4 תמונות",
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
  dealPublishedSuccess: "הדיל פורסם בהצלחה!",
  dealNoActiveProducts: "אין מוצרים פעילים — הוסף מוצרים בדף המוצרים לפני יצירת דיל",
  dealImage: "תמונת דיל",
  dealRedemptionLimit: "מימוש ללקוח",
  dealRedemptionOnce: "פעם אחת",
  dealRedemptionUnlimited: "ללא הגבלה",
  dealRedemptionLimited: "פעמים",
  dealRedemptionTimes: "כמה פעמים לקוח יכול להשתמש בדיל?",
  dealRedemptionCountLabel: "מספר שימושים ללקוח",
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
  openCustomerMessageComposer: "שלח הודעה",
  sendCustomerWhatsApp: "שלח בוואטסאפ",
  periodSummaryWeek: "7 הימים האחרונים",
  periodSummaryMonth: "30 הימים האחרונים",
  periodSummaryYear: "12 החודשים האחרונים",
  ownerAccount: "חשבון בעלים",
  sellerDetails: "פרטי המוכר",
  accountDetails: "פרטים",
  email: "אימייל",
  phone: "טלפון",
  phoneNotSet: "לא הוגדר",
  storeStatus: "סטטוס חנות",
  storeActive: "פעילה — לקוחות יכולים להיכנס",
  storeInactive: "מושבתת",
  storeInactiveHint:
    "לקוחות רואים שהעסק לא זמין. אם זה לא מכוון — פנה למנהל המערכת להפעלה.",
  logoutTitle: "יציאה מהמערכת",
  logoutHint: "החנות תישאר פתוחה במכשיר עד שתלחץ/י כאן",
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
  platformOwnerMessageTitle: "הודעה מצוות Linky",
  platformOwnerMessageGotIt: "הבנתי",
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
  subscriptionPlansHint: "14 ימי ניסיון חינם, ואז בחרו מנוי חודשי",
  subscriptionPremium: "רגיל",
  subscriptionUltimate: "מתקדם",
  subscriptionPerMonth: "לחודש",
  subscriptionChoose: "בחירת חבילה",
  subscriptionComingSoon: "תשלום מנוי יתווסף בהמשך — החנות נשארת פעילה בינתיים",
  subscriptionPreviewOnly: "בתצוגת דמו — בחירת חבילה ללא תשלום",
  subscriptionPremiumFeature1: "עד 500 הזמנות בחודש",
  subscriptionPremiumFeature2: "חנות מלאה, דשבורד ולקוחות",
  subscriptionPremiumFeature3: "התראות וסטטיסטיקות",
  subscriptionUltimateFeature1: "עד 1,000 הזמנות בחודש",
  subscriptionUltimateFeature2: "כל מה שבחבילה הרגילה",
  subscriptionUltimateFeature3: "תמיכה מועדפת",
  trialExpiredTitle: "נגמרה תקופת הניסיון",
  trialExpiredHint:
    "אחרי 14 ימי ניסיון חינם יש לבחור מנוי חודשי כדי להשאיר את החנות פעילה.",
  trialExpiredEndedOn: "תקופת הניסיון הסתיימה ב־",
  subscriptionPayMonthly: "שלם מנוי חודשי",
  subscriptionStatusTitle: "סטטוס מנוי",
  subscriptionActivePlan: "חבילה פעילה",
  subscriptionTrialRemaining: "ימים לסיום הניסיון",
  subscriptionRenewsOn: "חידוש ב-",
  subscriptionUsageThisMonth: "שימוש החודש",
  subscriptionUsageOf: "מתוך",
  subscriptionManageBilling: "נהל מנוי וחיובים",
  subscriptionNoBillingYet: "אין חיובים עדיין — בחרו חבילה למטה",
  subscriptionPortalError: "לא הצלחנו לפתוח את פורטל החיובים",
  subscriptionTrialExpiredShort: "תקופת הניסיון הסתיימה",
  alertsEnableTitle: "הפעלת התראות",
  alertsEnableHint: "בחרו על אילו אירועים תרצו לקבל התראה",
  alertOnCustomerInquiry: "התראה על פניית לקוח",
  alertOnChatMessage: "התראה על פנייה בצ'אט",
  alertOnNewOrder: "התראה על הזמנה חדשה",
  alertOnLowStock: "התראה כשהמלאי עומד להיגמר",
  alertOnNewAppointment: "התראה על תור חדש",
  alertOnAllSlotsFull: "התראה שכל התורים נתפסו",
  notificationTitle: "התראות",
  notificationEmpty: "אין התראות חדשות",
  notificationTypeInquiry: "פנייה רגילה",
  notificationTypeChat: "פנייה בצ'אט",
  notificationTypeOrder: "הזמנה חדשה",
  notificationTypeAppointment: "תור חדש",
  notificationTypeLowStock: "מלאי נמוך",
  notificationBackToList: "חזרה להתראות",
  notificationOpenOrders: "צפה בהזמנות",
  notificationOpenAppointments: "צפה בתורים",
  notificationOpenProducts: "לניהול מוצרים",
  notificationStockOut: "אזל מהמלאי",
  notificationStockLeft: "נשארו {n}",
  customerPreview: "תצוגת לקוח →",
  viewCustomerSide: "לראות את צד הלקוח",
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
  dealsAndLimits: "Deals & limits",
  services: "Services",
  appointments: "Appointments",
  appointmentSlots: "Time slots",
  appointmentCalendar: "Calendar",
  appointmentCalendarAndLimits: "Calendar & limits",
  appointmentGapMinutes: "Gap between appointments (minutes)",
  appointmentGapBetweenMeetings: "Gap between each appointment",
  appointmentDurationMinutes: "Appointment length (minutes)",
  appointmentBookingHours: "Booking hours",
  appointmentBookingFrom: "From",
  appointmentBookingUntil: "Until",
  saveAppointmentCalendar: "Save & update calendar",
  appointmentCalendarSaved: "Saved — calendar updated automatically",
  workingDays: "Working days",
  settings: "Settings",
  accountAndLink: "Account & store",
  storePanelsTitle: "What customers see on your store",
  storePanelDeals: "Deals",
  storePanelBroadcast: "Messages & alerts to customers",
  storePanelChat: "WhatsApp contact",
  storePanelInquiries: "Inquiries",
  storePanelFaq: "FAQ",
  storePanelOrderLimits: "Order limits",
  storePanelsSaveFailed: "Could not save panel settings",
  extras: "More details",
  customers: "Customers",
  customerMessage: "Message customers",
  customerInquiries: "Customer inquiries",
  customerInquiriesChat: "Chat",
  customerInquiriesInbox: "Inquiries",
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
  activeAppointments: "Appointments",
  appointmentHistory: "Appointment history",
  noActiveOrders: "No active orders",
  noOrderHistory: "No orders in history",
  noActiveAppointments: "No active appointments",
  noAppointmentHistory: "No appointments in history",
  noOrders: "No orders.",
  noOrdersYet: "No orders yet.",
  total: "Total",
  prepSummaryButton: "Summary",
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
  addNewDeal: "Add new deal",
  existingDeals: "Existing deals",
  dealOff: "Off",
  noExistingDeals: "No deals yet",
  closeForm: "Close form",
  saveDeal: "Save deal",
  saving: "Saving...",
  adding: "Adding...",
  sending: "Sending...",
  edit: "Edit",
  delete: "Delete",
  active: "Active",
  status: "Status",
  inactive: "Inactive",
  hidden: "Hidden",
  show: "Show",
  hide: "Hide",
  enableOrderLimit: "Limit when customers can order",
  orderScheduleLimitTitle: "Order hours & days limit",
  appointmentCancelLimitTitle: "When customers can cancel",
  appointmentCancelUnitLabel: "Choose hours or days before the appointment",
  appointmentCancelByHours: "Hours before",
  appointmentCancelByDays: "Days before",
  appointmentCancelHoursBefore: "How many hours before",
  appointmentCancelDaysBefore: "How many days before",
  saveAppointmentCancelSettings: "Save cancellation policy",
  appointmentCancelSaved: "Saved — cancellation policy applies to customers",
  saveWorkingDaysSettings: "Save working days",
  workingDayToggleHint: "Tap — open or closed for appointments",
  workingDaysNeedOpenDay: "Keep at least one day open for appointments",
  workingDaysPickHint: "Tap the day name to open or close it for appointments",
  homeCalendarPrevMonth: "Previous month",
  homeCalendarNextMonth: "Next month",
  homeCalendarFullDayHint: "Fully booked day",
  homeCalendarDayTitle: "Appointments on this day",
  homeCalendarNoAppointmentsDay: "No appointments on this day",
  homeCalendarBookedAppointments: "Booked appointments",
  homeCalendarOpenAppointments: "Open appointments",
  homeCalendarDaySlots: "Calendar times",
  homeCalendarNoSlotsDay: "No times on this day",
  homeCalendarSlotOpen: "Open",
  homeCalendarSlotFull: "Full",
  homeUpcomingAppointments: "Upcoming appointments",
  homeNoUpcomingAppointments: "No upcoming appointments",
  homeUpcomingRentals: "Upcoming rentals",
  homeNoUpcomingRentals: "No upcoming rentals",
  rentalNight: "night",
  rentalNights: "nights",
  rentalDay: "day",
  rentalDays: "days",
  homeOpenCalendar: "Open calendar",
  homeCalendarTitle: "Calendar",
  homeCalendarQuickBook: "Book slot",
  homeCalendarHistoryHint:
    "For older dates — go to previous months and tap a day on the calendar.",
  sellerWalkInCustomer: "Customer",
  sellerSelfBooking: "Seller booking",
  appointmentSlotTime: "Appointment time",
  appointmentToday: "Today",
  appointmentTomorrow: "Tomorrow",
  appointmentService: "Service",
  appointmentCustomerNote: "Note",
  openCustomerDetails: "Open customer details",
  appointmentPending: "Pending",
  appointmentConfirmed: "Confirmed",
  appointmentCancelled: "Cancelled",
  saveOrderSettings: "Save order settings",
  whichDays: "Which days",
  whichHours: "Which hours",
  fromHour: "From",
  toHour: "Until",
  addProduct: "Add product",
  addService: "Add service",
  noProductsYet: "No products yet",
  noServicesYet: "No services yet",
  productAddedTitle: "Product added!",
  productAddedDetail: "Customers can see it in your store",
  serviceAddedTitle: "Service added!",
  serviceAddedDetail: "Customers can choose it when booking",
  serviceDurationMinutes: "Service length (minutes)",
  serviceDurationRequired: "Enter service length (at least 15 minutes)",
  appointmentBookingByDay: "Book by day only",
  appointmentBookingByDayHint: "Customers pick a day only — no times. Calendar capacity updates automatically.",
  appointmentCalendarUpdated: "Calendar updated",
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
  customerMarkedResolved: "Customer: issue resolved",
  customerMarkedNotResolved: "Customer: issue not resolved yet",
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
  faqPublishedTitle: "Question published!",
  faqPublishedDetail: "Customers will see it on your store page",
  celebrationOk: "Great",
  comingSoon: "Coming soon",
  sellerGuideTitle: "Quick guide — let's go!",
  sellerGuidePurpose:
    "Linky gives you a store to take orders. Everything lands in one clear queue — you see, summarize, and confirm. You choose when and how much customers can order. For them — it's tidy and easy, with deals too.",
  sellerGuidePurposeAppointments:
    "Linky gives you a place to book appointments. Everything lands in one clear queue — you see, summarize, and confirm. You choose when and how many slots are open. For customers — it's tidy and easy, with deals too.",
  sellerGuideIntro:
    "Five simple steps to run your store — read this first:",
  sellerGuideIntroAppointments:
    "Five essentials (+ a bonus). How to run an appointments business — read this first:",
  sellerGuideStepNavTitle: "1. Bottom navigation",
  sellerGuideStepNavBody:
    "Two fixed buttons: Home — daily summary and your customer link. Actions — everything you manage.",
  sellerGuideStepNavBodyAppointments:
    "Two fixed buttons: Home — your booking calendar and customer link. Actions — business settings and communication.",
  sellerGuideStepHomeCalendarTitle: "2. Home calendar",
  sellerGuideStepHomeCalendarBody:
    "On Home you'll see a monthly calendar with open booking days. Tap a day to view all appointments that day.",
  sellerGuideCalendarTapHint: "Tap a day to view appointments",
  sellerGuideStepActionsTitle: "2. Actions screen",
  sellerGuideStepActionsBody:
    "Tap Actions at the bottom. You'll see two big tiles — Customers and Store. That's your control center.",
  sellerGuideStepCustomersTitle: "3. Customers",
  sellerGuideStepCustomersBody:
    "In Actions tap Customers. Handle inquiries, chat, broadcasts, and FAQ there.",
  sellerGuideStepStoreTitle: "4. Store",
  sellerGuideStepStoreTitleAppointments: "5. Business settings",
  sellerGuideStepStoreBody:
    "In Actions tap Store. Add products, track orders, set deals and limits.",
  sellerGuideStepStoreAppointmentsBody:
    "In Actions tap Store. Set up services, appointment settings, calendar & slots, and limits.",
  sellerGuideStepLinkTitle: "5. Customer link",
  sellerGuideStepLinkTitleAppointments: "6. Customer link",
  sellerGuideStepLinkBody:
    "Go back to Home (bottom bar). Copy or share your store link — that's what customers open to order.",
  sellerGuideStepLinkBodyAppointments:
    "Go back to Home (bottom bar). Copy or share your link — customers open it to book an appointment.",
  sellerGuideStepDoneTitle: "You're ready!",
  sellerGuideStepDoneBody:
    "First step: add at least one product with a photo and price. Then share your link.",
  sellerGuideStepDoneAppointmentsBody:
    "First step: add at least one service and set time slots. Then share your link.",
  sellerGuidePath: "Path",
  sellerGuideSkip: "Skip",
  sellerGuideNext: "Next",
  sellerGuideBack: "Back",
  sellerGuideFinish: "Got it!",
  sellerGuideAddProduct: "Add first product",
  sellerGuideAddService: "Add first service",
  sellerGuideAddCalendar: "Set up calendar & slots",
  appointmentStoreSetupTitle: "Working days & booking hours",
  appointmentStoreSetupIntro:
    "Before you start — choose which days and hours customers can book, then save. Without this your calendar stays empty.",
  appointmentStoreSetupContinue: "Continue to the Linky tour",
  sellerGuideStepCounter: "Step {current} of {total}",
  sellerGuideWelcomeTipAddProductTitle: "How do I add a product?",
  sellerGuideWelcomeTipAddProductBody:
    "Tap Actions at the bottom → Store → Products → Add product. Enter name, price, and photo — then save.",
  sellerGuideWelcomeTipOrdersTitle: "Where are orders? How do I approve?",
  sellerGuideWelcomeTipOrdersBody:
    "Actions → Store → Orders. Tap the customer's name, see what they ordered, then tap Confirm.",
  sellerGuideWelcomeTipCustomersTitle: "How do I talk to customers?",
  sellerGuideWelcomeTipCustomersBody:
    "Actions → Customers → Customer inquiries. Open Chat or Inquiries and reply.",
  sellerGuideWelcomeTipAddServiceTitle: "How do I set up a service?",
  sellerGuideWelcomeTipAddServiceBody:
    "Actions → Store → Services → Add service. Enter name, price, and service duration in minutes — then save.",
  sellerGuideWelcomeTipBookedAppointmentsTitle: "Where are booked appointments?",
  sellerGuideWelcomeTipBookedAppointmentsBody:
    "On Home under upcoming appointments. Also Actions → Store → Appointments for active bookings, and Appointment history for past ones.",
  sellerGuideWelcomeTipCalendarTitle: "Where is the calendar?",
  sellerGuideWelcomeTipCalendarBody:
    "On Home — a monthly calendar with open booking days. Tap a day to see that day's appointments, or Open calendar for the full view.",
  sellerGuideWelcomeTipDurationGapTitle: "Bonus: duration & gap between appointments",
  sellerGuideWelcomeTipDurationGapBody:
    "Per-service duration — in the Add service form. Gap between appointments and booking hours: Actions → Store → Calendar.",
  sellerGuideWelcomeTipDealsTitle: "How do I add a deal?",
  sellerGuideWelcomeTipDealsBody:
    "Actions → Store → Deals & limits → Deals → Add deal. Pick products, price, and expiry — then publish.",
  sellerGuideWelcomeTipLimitsTitle: "How do I set order limits?",
  sellerGuideWelcomeTipLimitsBody:
    "Actions → Store → Deals & limits → Limits. Set the hours and days when customers can order.",
  sellerGuideReplayTitle: "Getting started guide",
  sellerGuideReplayBody: "Want to walk through the first steps in Linky again?",
  sellerGuideReplayAction: "Show guide again",
  liveTourIntroTitle: "Let's add your first product",
  liveTourIntroBody:
    "A quick hands-on tour — we'll walk you through the real screens until your product is saved.",
  liveTourIntroTitleAppointments: "Let's add your first service",
  liveTourIntroBodyAppointments:
    "A quick hands-on tour — we'll walk you through until your service is saved.",
  liveTourStart: "Start guided tour",
  liveTourNavActionsTitle: "Tap Actions",
  liveTourNavActionsBody: "At the bottom of the screen — your business control center.",
  liveTourHubStoreTitle: "Tap Store",
  liveTourHubStoreBody: "Products, orders, deals, and limits live here.",
  liveTourHubStoreAppointmentsBody: "Services, appointments, calendar, and limits live here.",
  liveTourHubProductsTitle: "Tap Products",
  liveTourHubProductsBody: "Open the product list and add a new item.",
  liveTourHubServicesTitle: "Tap Services",
  liveTourHubServicesBody: "Open the services customers can book.",
  liveTourAddProductTitle: "Tap Add product",
  liveTourAddProductBody: "The form opens — we'll fill it in together.",
  liveTourAddServiceTitle: "Tap Add service",
  liveTourAddServiceBody: "The form opens — we'll fill in the service details.",
  liveTourProductNameTitle: "Product name",
  liveTourProductNameBody: "Type a name — e.g. Chocolate cake, Sourdough bread…",
  liveTourProductPriceTitle: "Price",
  liveTourProductPriceBody: "Enter a price in your currency (e.g. 45).",
  liveTourProductSubmitTitle: "Save the product",
  liveTourProductSubmitBody: "Tap Add product at the bottom of the form to save.",
  liveTourServiceNameTitle: "Service name",
  liveTourServiceNameBody: "Type a name — e.g. Consultation, Haircut…",
  liveTourServicePriceTitle: "Service price",
  liveTourServicePriceBody: "Enter the price.",
  liveTourServiceSubmitTitle: "Save the service",
  liveTourServiceSubmitBody: "Tap Add service at the bottom of the form to save.",
  liveTourCompleteTitle: "Great — product added!",
  liveTourCompleteBody: "Your first product is live. Share your store link from Home.",
  liveTourCompleteBodyAppointments:
    "Your first service is ready. Set up calendar slots and share your link.",
  liveTourTapHighlight: "Tap the highlighted area",
  liveTourFillHighlight: "Fill in the highlighted field",
  liveTourSaveHighlight: "Save using the highlighted button",
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
  productStockRemaining: "{n} left",
  productStockUnlimitedList: "Unlimited stock",
  productStockLow: "Low stock",
  productStockEdit: "Update stock",
  productImageUpload: "Upload image",
  productImageUploading: "Uploading…",
  productImageDropHint: "Click or drag — then crop to a square",
  productImagePreviewAlt: "Preview",
  productImageRemove: "Remove image",
  productImageTypeError: "Use JPG, PNG, WebP, or GIF",
  productImageSizeError: "Maximum image size is 2MB",
  productImageReadError: "Could not read the image",
  productImageCropTitle: "Crop image",
  productImageCropHint: "Drag and zoom to fit the store square",
  productImageCropConfirm: "Save",
  productImageCropZoom: "Zoom",
  productImageEdit: "Edit image",
  productImageReplace: "Replace",
  productImagesHint: "Up to 4 images",
  productImagesLimit: "You can add up to 4 images",
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
  dealPublishedSuccess: "Deal published successfully!",
  dealNoActiveProducts: "No active products — add products before creating a deal",
  dealImage: "Deal image",
  dealRedemptionLimit: "Per customer",
  dealRedemptionOnce: "Once",
  dealRedemptionUnlimited: "Unlimited",
  dealRedemptionLimited: "times",
  dealRedemptionTimes: "How many times can a customer use this deal?",
  dealRedemptionCountLabel: "Uses per customer",
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
  openCustomerMessageComposer: "Send message",
  sendCustomerWhatsApp: "Send on WhatsApp",
  periodSummaryWeek: "Last 7 days",
  periodSummaryMonth: "Last 30 days",
  periodSummaryYear: "Last 12 months",
  ownerAccount: "Owner account",
  sellerDetails: "Seller details",
  accountDetails: "Details",
  email: "Email",
  phone: "Phone",
  phoneNotSet: "Not set",
  storeStatus: "Store status",
  storeActive: "Live — customers can visit",
  storeInactive: "Disabled",
  storeInactiveHint:
    "Customers see the business as unavailable. Contact support if this is unexpected.",
  logoutTitle: "Sign out",
  logoutHint: "Your store stays open on this device until you sign out here",
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
  platformOwnerMessageTitle: "Message from Linky",
  platformOwnerMessageGotIt: "Got it",
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
  subscriptionPlansHint: "14-day free trial, then choose a monthly plan",
  subscriptionPremium: "Standard",
  subscriptionUltimate: "Pro",
  subscriptionPerMonth: "per month",
  subscriptionChoose: "Choose plan",
  subscriptionComingSoon: "Subscription checkout coming later — your store stays active for now",
  subscriptionPreviewOnly: "Preview mode — plan selection without payment",
  subscriptionPremiumFeature1: "Up to 500 orders per month",
  subscriptionPremiumFeature2: "Full store, dashboard & customers",
  subscriptionPremiumFeature3: "Alerts & analytics",
  subscriptionUltimateFeature1: "Up to 1,000 orders per month",
  subscriptionUltimateFeature2: "Everything in Standard",
  subscriptionUltimateFeature3: "Priority support",
  trialExpiredTitle: "Trial period ended",
  trialExpiredHint:
    "After your 14-day free trial, choose a monthly plan to keep your store active.",
  trialExpiredEndedOn: "Trial ended on ",
  subscriptionPayMonthly: "Pay monthly subscription",
  subscriptionStatusTitle: "Subscription status",
  subscriptionActivePlan: "Active plan",
  subscriptionTrialRemaining: "Trial days left",
  subscriptionRenewsOn: "Renews on",
  subscriptionUsageThisMonth: "This month's usage",
  subscriptionUsageOf: "of",
  subscriptionManageBilling: "Manage subscription & billing",
  subscriptionNoBillingYet: "No billing yet — choose a plan below",
  subscriptionPortalError: "Could not open the billing portal",
  subscriptionTrialExpiredShort: "Your free trial has ended",
  alertsEnableTitle: "Enable alerts",
  alertsEnableHint: "Choose which events should trigger a notification",
  alertOnCustomerInquiry: "Alert on customer inquiry",
  alertOnChatMessage: "Alert on chat message",
  alertOnNewOrder: "Alert on new order",
  alertOnLowStock: "Alert when stock is low",
  alertOnNewAppointment: "Alert on new appointment",
  alertOnAllSlotsFull: "Alert when all slots are full",
  notificationTitle: "Notifications",
  notificationEmpty: "No new notifications",
  notificationTypeInquiry: "Customer inquiry",
  notificationTypeChat: "Chat message",
  notificationTypeOrder: "New order",
  notificationTypeAppointment: "New appointment",
  notificationTypeLowStock: "Low stock",
  notificationBackToList: "Back to notifications",
  notificationOpenOrders: "View orders",
  notificationOpenAppointments: "View appointments",
  notificationOpenProducts: "Manage products",
  notificationStockOut: "Out of stock",
  notificationStockLeft: "{n} left",
  customerPreview: "Customer preview →",
  viewCustomerSide: "View customer store",
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
