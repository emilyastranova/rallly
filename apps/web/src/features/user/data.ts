import "server-only";

import type { User } from "@rallly/database";
import { prisma } from "@rallly/database";
import type { UserDTO } from "@/features/user/schema";

export const createUserDTO = (user: User): UserDTO => ({
  id: user.id,
  name: user.name,
  image: user.image ?? undefined,
  email: user.email,
  role: user.role,
  banned: user.banned,
  timeZone: user.timeZone || undefined,
  timeFormat: user.timeFormat ?? undefined,
  locale: user.locale ?? undefined,
  weekStart: user.weekStart ?? undefined,
  primaryGroupId: user.primaryGroupId ?? undefined,
  isGuest: user.isAnonymous,
  deletedAt: user.deletedAt ?? undefined,
  emailVerified: user.emailVerified ?? false,
});

export const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      primaryGroup: { select: { id: true, name: true } },
      groups: { select: { id: true, name: true } },
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...createUserDTO(user),
    primaryGroup: user.primaryGroup ?? undefined,
    groups: user.groups,
  };
};

export function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      image: true,
    },
  });
}

export const getUserCount = async () => {
  return await prisma.user.count({
    where: {
      isAnonymous: false,
    },
  });
};

export async function getUserDeletionDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    customerId: undefined,
    hasActiveSubscription: false,
  };
}

export const getUserLocaleByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { locale: true },
  });
  return user?.locale ?? null;
};

export const isEmailTaken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return !!user;
};

export const getUserHasPassword = async (userId: string) => {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "credential",
    },
  });
  return !!account;
};

export const getUserHasNoAccounts = async (userId: string) => {
  const accountCount = await prisma.account.count({
    where: {
      userId,
    },
  });
  return accountCount === 0;
};
