import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseIsraeliMobilePhone } from "@/lib/phone";
import { syntheticOwnerEmail } from "@/lib/owner-auth-phone";
import {
  safeUserWithPasswordSelect,
  type SafeUser,
} from "@/lib/security/user-select";

export type LoginUser = Prisma.UserGetPayload<{
  select: typeof safeUserWithPasswordSelect;
}>;

function loginMatchConditions(identifier: string): Prisma.UserWhereInput[] {
  const trimmed = identifier.trim();
  const phone = parseIsraeliMobilePhone(trimmed);
  const syntheticEmail = phone ? syntheticOwnerEmail(phone) : null;
  const conditions: Prisma.UserWhereInput[] = [];

  if (phone) conditions.push({ phone });
  if (syntheticEmail) conditions.push({ email: syntheticEmail });

  return conditions;
}

/** All owner accounts that match a login phone number. */
export async function findLoginCandidates(
  identifier: string
): Promise<LoginUser[]> {
  const conditions = loginMatchConditions(identifier);
  if (conditions.length === 0) return [];

  return prisma.user.findMany({
    where: { OR: conditions },
    select: safeUserWithPasswordSelect,
  });
}

/** Verify password and prefer the account that already owns a business. */
export async function authenticateOwnerLogin(
  identifier: string,
  password: string
): Promise<LoginUser | null> {
  const candidates = await findLoginCandidates(identifier);
  if (candidates.length === 0) return null;

  const matches: LoginUser[] = [];
  for (const candidate of candidates) {
    const valid = await bcrypt.compare(password, candidate.passwordHash);
    if (valid) matches.push(candidate);
  }

  if (matches.length === 0) return null;
  return matches.find((user) => user.business) ?? matches[0];
}

/** Ensure business is present even if the relation was not eagerly loaded. */
export async function resolveOwnerBusiness(
  user: SafeUser
): Promise<SafeUser["business"]> {
  if (user.business) return user.business;

  return prisma.business.findUnique({
    where: { ownerId: user.id },
  });
}

export async function ownerHasBusiness(user: SafeUser): Promise<boolean> {
  return !!(await resolveOwnerBusiness(user));
}
