import { z } from "zod";
import { isValidPhone, INVALID_PHONE_MESSAGE_HE } from "@/lib/phone";
import { STORE_THEME_IDS } from "@/lib/store-themes";

export const customerPhoneSchema = z
  .string()
  .min(1, INVALID_PHONE_MESSAGE_HE)
  .max(20)
  .refine(isValidPhone, { message: INVALID_PHONE_MESSAGE_HE });

export const optionalCustomerPhoneSchema = z
  .string()
  .max(20)
  .optional()
  .refine((value) => !value?.trim() || isValidPhone(value), {
    message: INVALID_PHONE_MESSAGE_HE,
  });

export const emailSchema = z.string().email().max(254);

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "נא להזין טלפון").max(254),
  password: z.string().min(1, "נא להזין סיסמה").max(128),
});

export const signupSchema = z.object({
  phone: customerPhoneSchema,
  password: z.string().min(8, "סיסמה: לפחות 8 תווים").max(128),
  name: z.string().trim().min(2).max(80),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "סיסמה: לפחות 8 תווים").max(128),
});

export const masterLoginSchema = z.object({
  password: z.string().min(1).max(128),
});

export const adminUserPatchSchema = z
  .object({
    email: emailSchema.optional(),
    password: z.string().min(8, "סיסמה: לפחות 8 תווים").max(128).optional(),
  })
  .refine((data) => data.email !== undefined || data.password !== undefined, {
    message: "נא לספק מייל או סיסמה לעדכון",
  });

export const businessCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(500).optional(),
  type: z
    .enum(["STORE", "APPOINTMENTS"])
    .refine((value) => value === "STORE", {
      message: "מצב פגישות יהיה זמין בקרוב",
    }),
  acceptTerms: z.literal(true),
});

export const businessPatchSchema = z.object({
  description: z.string().max(500).nullable().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(500).optional(),
  price: z.number().positive().max(1_000_000),
  salePrice: z.number().positive().max(1_000_000).optional().nullable(),
  imageUrl: z.string().max(2048).optional(),
  stock: z.number().int().min(0).max(1_000_000).optional().nullable(),
  serviceDurationMinutes: z.number().int().min(15).max(480).optional().nullable(),
});

export const productPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().max(1_000_000).optional(),
  salePrice: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().max(2048).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000).nullable().optional(),
  serviceDurationMinutes: z.number().int().min(15).max(480).nullable().optional(),
});

export const publicInquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "שם: לפחות 2 תווים")
    .max(80, "שם ארוך מדי"),
  customerPhone: optionalCustomerPhoneSchema,
  customerEmail: z.string().email("אימייל לא תקין").optional().or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(2, "נושא: לפחות 2 תווים")
    .max(120, "נושא ארוך מדי"),
  message: z
    .string()
    .trim()
    .min(5, "פירוט הפנייה: לפחות 5 תווים")
    .max(2000, "ההודעה ארוכה מדי"),
});

export const publicChatPostSchema = z.object({
  channel: z.literal("SELLER"),
  customerName: z.string().trim().min(2, "שם: לפחות 2 תווים").max(80),
  customerPhone: customerPhoneSchema,
  body: z.string().trim().min(1, "נא לכתוב הודעה").max(2000),
});

export const sellerPrivateChatReplySchema = z.object({
  customerPhone: customerPhoneSchema,
  body: z.string().trim().min(1).max(2000),
});

export const storeThemePatchSchema = z.object({
  storeTheme: z.enum(STORE_THEME_IDS).optional(),
  storeLocale: z.enum(["he", "en"]).optional(),
});

export const storeLegalPatchSchema = z.object({
  storePolicy: z.string().max(20_000).nullable().optional(),
  storeTerms: z.string().max(20_000).nullable().optional(),
});

export const storeBroadcastPatchSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export function zodFirstError(parsed: z.ZodSafeParseError<unknown>): string {
  return parsed.error.issues[0]?.message ?? "נתונים לא תקינים";
}
