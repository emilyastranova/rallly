import "server-only";

import { prisma } from "@rallly/database";

export async function listGroups({ spaceId }: { spaceId?: string } = {}) {
  const groups = await prisma.group.findMany({
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

  // Deduplicate by lowercase name, preferring space-specific groups over global ones
  const map = new Map<string, (typeof groups)[number]>();
  for (const group of groups) {
    const key = group.name.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, group);
    } else if (!existing.spaceId && group.spaceId) {
      map.set(key, group);
    }
  }

  return Array.from(map.values());
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
