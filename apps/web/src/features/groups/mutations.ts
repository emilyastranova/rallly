import "server-only";

import { prisma } from "@rallly/database";

export async function createGroup({
  name,
  description,
  spaceId,
}: {
  name: string;
  description?: string;
  spaceId?: string;
}) {
  return prisma.group.create({
    data: {
      name,
      description,
      spaceId,
    },
  });
}

export async function deleteGroup({ groupId }: { groupId: string }) {
  return prisma.group.delete({
    where: { id: groupId },
  });
}

export async function updateUserGroups({
  userId,
  primaryGroupId,
  groupIds,
}: {
  userId: string;
  primaryGroupId?: string | null;
  groupIds: string[];
}) {
  const allGroupIds = new Set<string>(groupIds);
  if (primaryGroupId) {
    allGroupIds.add(primaryGroupId);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      primaryGroupId: primaryGroupId || null,
      groups: {
        set: Array.from(allGroupIds).map((id) => ({ id })),
      },
    },
  });
}
