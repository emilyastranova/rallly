import "server-only";

import { prisma } from "@rallly/database";

export async function listGroups({ spaceId }: { spaceId?: string } = {}) {
  return prisma.group.findMany({
    where: spaceId ? { OR: [{ spaceId }, { spaceId: null }] } : undefined,
    include: {
      _count: {
        select: {
          members: true,
          primaryUsers: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getUserGroups({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      primaryGroupId: true,
      primaryGroup: { select: { id: true, name: true } },
      groups: { select: { id: true, name: true } },
    },
  });

  return {
    primaryGroupId: user?.primaryGroupId ?? null,
    primaryGroup: user?.primaryGroup ?? null,
    groups: user?.groups ?? [],
  };
}
