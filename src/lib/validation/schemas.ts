import { z } from "zod";
import { STORE_THEME_IDS } from "@/lib/store-themes";

export const emailSchema = z.string().email().max(254);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "נא להזין סיסמה").max(128),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "סיסמה: לפחות 8 תווים").max(128),
  name: z.string().trim().min(2).max(80),
});

export const masterLoginSchema = z.object({
  password: z.string().min(1).max(128),
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
  stock: z.number().int().min(0).max(1_000_000).optional().nullable(),
});

export const productPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().max(1_000_000).optional(),
  salePrice: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().max(2048).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000).nullable().optional(),
});

export const publicChatPostSchema = z.object({
  channel: z.literal("SELLER"),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().max(20),
  body: z.string().trim().min(1).max(2000),
});

export const sellerPrivateChatReplySchema = z.object({
  customerPhone: z.string().min(9).max(20),
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
