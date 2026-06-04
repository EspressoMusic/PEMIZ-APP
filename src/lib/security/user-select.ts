import type { Prisma } from "@prisma/client";

/** Never expose passwordHash or verification tokens in API responses. */
export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  phoneVerified: true,
  emailVerified: true,
  role: true,
  createdAt: true,
  business: true,
} satisfies Prisma.UserSelect;

export const safeUserWithPasswordSelect = {
  ...safeUserSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
