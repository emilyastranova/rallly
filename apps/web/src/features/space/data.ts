import "server-only";

import type { SpaceMemberRole as DBSpaceMemberRole } from "@rallly/database";
import { prisma } from "@rallly/database";
import { cache } from "react";

import { getInstancePolicy } from "@/features/instance-policy/data";
import type { MemberDTO } from "@/features/space/member/types";
import { effectiveSpaceMemberWhere } from "@/features/space/member/utils";
import {
  createSpaceDTO,
  fromDBRole,
  isSpaceBrandingActive,
} from "@/features/space/utils";

function createMemberDTO(member: {
  id: string;
  userId: string;
  spaceId: string;
  role: DBSpaceMemberRole;
  space: {
    ownerId: string;
  };
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}) {
  return {
    id: member.id,
    name: member.user.name,
    userId: member.userId,
    spaceId: member.spaceId,
    email: member.user.email,
    image: member.user.image ?? undefined,
    role: fromDBRole(member.role),
    isOwner: member.userId === member.space.ownerId,
  } satisfies MemberDTO;
}

export async function spaceExists(spaceId: string) {
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: { id: true },
  });
  return space !== null;
}

export async function getSpaceSeatCount(spaceId: string) {
  return await prisma.spaceMember.count({
    where: {
      spaceId: spaceId,
    },
  });
}

/**
 * Gets the total number of seats available for a space
 * Handles both cloud-hosted (Stripe subscription) and self-hosted (license-based) deployments
 */
export async function getTotalSeatsForSpace(_spaceId: string): Promise<number> {
  return Number.POSITIVE_INFINITY;
}

export const getMember = async (id: string) => {
  const member = await prisma.spaceMember.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      spaceId: true,
      role: true,
      space: {
        select: {
          ownerId: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  return createMemberDTO(member);
};

export async function getSpaceBranding(spaceId: string) {
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: {
      name: true,
      image: true,
      tier: true,
      showBranding: true,
      primaryColor: true,
    },
  });

  if (!space) {
    return null;
  }

  const { spaceBrandingAllowed } = await getInstancePolicy();

  if (!isSpaceBrandingActive({ ...space, spaceBrandingAllowed })) {
    return { ...space, showBranding: false, primaryColor: null };
  }

  return space;
}

export const getOwnedSpace = cache(async (userId: string) => {
  return prisma.space.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  });
});

export const listSpacesForUser = cache(async (userId: string) => {
  const result = await prisma.spaceMember.findMany({
    where: effectiveSpaceMemberWhere({ userId }),
    select: {
      role: true,
      space: {
        select: {
          id: true,
          name: true,
          image: true,
          ownerId: true,
          tier: true,
          primaryColor: true,
          showBranding: true,
          hideAttribution: true,
          shared: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  const policy = await getInstancePolicy();

  return result.map((spaceMember) =>
    createSpaceDTO({
      space: {
        ...spaceMember.space,
        role: spaceMember.role,
        memberCount: spaceMember.space._count.members,
        seatCount: Number.POSITIVE_INFINITY,
      },
      policy,
    }),
  );
});

export const getActiveSpaceForUser = cache(async (userId: string) => {
  const spaceMember = await prisma.spaceMember.findFirst({
    where: effectiveSpaceMemberWhere({ userId }),
    orderBy: {
      lastSelectedAt: "desc",
    },
    include: {
      space: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!spaceMember) {
    return null;
  }

  return createSpaceDTO({
    space: {
      ...spaceMember.space,
      role: spaceMember.role,
      memberCount: spaceMember.space._count.members,
      seatCount: Number.POSITIVE_INFINITY,
      subscriptionPastDue: false,
    },
    policy: await getInstancePolicy(),
  });
});

export const getDefaultSpace = cache(async () => {
  try {
    if (process.env.DEFAULT_SPACE_ID) {
      const space = await prisma.space.findUnique({
        where: { id: process.env.DEFAULT_SPACE_ID },
      });
      if (space) return space;
    }

    if (process.env.DEFAULT_SPACE_NAME) {
      const space = await prisma.space.findFirst({
        where: {
          name: {
            equals: process.env.DEFAULT_SPACE_NAME.trim(),
            mode: "insensitive",
          },
        },
      });
      if (space) return space;
    }

    if (process.env.INITIAL_ADMIN_EMAIL) {
      const space = await prisma.space.findFirst({
        where: {
          owner: {
            email: {
              equals: process.env.INITIAL_ADMIN_EMAIL.trim(),
              mode: "insensitive",
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      if (space) return space;
    }

    return await prisma.space.findFirst({
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return null;
  }
});

export async function ensureUserInDefaultSpace(userId: string) {
  try {
    const defaultSpace = await getDefaultSpace();
    if (!defaultSpace) return null;

    const existingMembership = await prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId: defaultSpace.id,
          userId,
        },
      },
    });

    if (!existingMembership) {
      await prisma.spaceMember.create({
        data: {
          spaceId: defaultSpace.id,
          userId,
          role: "MEMBER",
          lastSelectedAt: new Date(),
        },
      });
    }

    return defaultSpace;
  } catch {
    return null;
  }
}
