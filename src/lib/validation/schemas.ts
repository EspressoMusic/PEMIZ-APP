import { z } from "zod";
import { isValidPhone } from "@/lib/phone";
import type { AppLocale } from "@/lib/app-locale";
import { getAuthMessages } from "@/lib/auth-messages";
import { STORE_THEME_IDS, STORE_DECORATION_IDS } from "@/lib/store-themes";

function buildCustomerPhoneSchema(locale: AppLocale) {
  const msg = getAuthMessages(locale);
  return z
    .string()
    .min(1, msg.invalidPhone)
    .max(20)
    .refine(isValidPhone, { message: msg.invalidPhone });
}

export const customerPhoneSchema = buildCustomerPhoneSchema("he");

export const optionalCustomerPhoneSchema = z
  .string()
  .max(20)
  .optional()
  .refine((value) => !value?.trim() || isValidPhone(value), {
    message: getAuthMessages("he").invalidPhone,
  });

export const emailSchema = z.string().email().max(254);

export function loginSchemaForLocale(locale: AppLocale) {
  const msg = getAuthMessages(locale);
  return z.object({
    identifier: buildCustomerPhoneSchema(locale),
    password: z.string().min(1, msg.passwordRequired).max(128),
  });
}

export const loginSchema = loginSchemaForLocale("he");

export function signupSchemaForLocale(locale: AppLocale) {
  const msg = getAuthMessages(locale);
  return z.object({
    phone: buildCustomerPhoneSchema(locale),
    password: z.string().min(8, msg.passwordMinLength).max(128),
    name: z.string().trim().min(2, msg.nameTooShort).max(80),
    firebaseIdToken: z.string().min(1, msg.googleVerificationRequired),
  });
}

export const signupSchema = signupSchemaForLocale("he");

export const forgotPasswordSchema = z.object({
  phone: customerPhoneSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const masterLoginSchema = z.object({
  password: z.string().min(1).max(128),
});

export const adminUserPatchSchema = z
  .object({
    email: emailSchema.optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(128).optional(),
  })
  .refine((data) => data.email !== undefined || data.password !== undefined, {
    message: "Provide an email or password to update",
  });

export const businessCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["STORE", "APPOINTMENTS"]),
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
  imageUrls: z.array(z.string().max(2048)).max(4).optional(),
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
  imageUrls: z.array(z.string().max(2048)).max(4).optional(),
  stock: z.number().int().min(0).max(1_000_000).nullable().optional(),
  serviceDurationMinutes: z.number().int().min(15).max(480).nullable().optional(),
});

export const publicInquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  customerPhone: optionalCustomerPhoneSchema,
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(2, "Subject must be at least 2 characters")
    .max(120, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message is too long"),
});

export const demoBookingSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  customerEmail: z.string().email("Invalid email").max(254),
  customerPhone: optionalCustomerPhoneSchema,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(["en", "he"]).optional(),
});

export const publicChatPostSchema = z.object({
  channel: z.literal("SELLER"),
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  customerPhone: customerPhoneSchema,
  body: z.string().trim().min(1, "Please enter a message").max(2000),
});

export const sellerPrivateChatReplySchema = z.object({
  customerPhone: customerPhoneSchema,
  body: z.string().trim().min(1).max(2000),
});

export const storeThemePatchSchema = z.object({
  storeTheme: z.enum(STORE_THEME_IDS).optional(),
  storeDecoration: z.enum(STORE_DECORATION_IDS).optional(),
  storeLocale: z.enum(["he", "en"]).optional(),
});

export const storeLegalPatchSchema = z.object({
  storePolicy: z.string().max(20_000).nullable().optional(),
  storeTerms: z.string().max(20_000).nullable().optional(),
});

export const storeInfoPatchSchema = z.object({
  storeOpeningHours: z.string().max(500).nullable().optional(),
  storeAddress: z.string().max(300).nullable().optional(),
});

export const storeBroadcastPatchSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export const publicReviewSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  rating: z.number().int().min(1, "Rating is required").max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export function zodFirstError(
  parsed: z.ZodSafeParseError<unknown>,
  locale: AppLocale = "en"
): string {
  return parsed.error.issues[0]?.message ?? getAuthMessages(locale).invalidData;
}
