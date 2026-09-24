import "server-only";

import { cache } from "react";
import { getUserGroups, listGroups, listSpaceMembersWithGroups } from "./data";

export const loadGroups = cache(async (options: { spaceId?: string } = {}) => {
  return listGroups(options);
});

export const loadUserGroups = cache(async ({ userId }: { userId: string }) => {
  return getUserGroups({ userId });
});

export const loadSpaceMembersWithGroups = cache(
  async ({ spaceId }: { spaceId: string }) => {
    return listSpaceMembersWithGroups({ spaceId });
  },
);
