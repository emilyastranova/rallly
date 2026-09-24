import "server-only";

import { cache } from "react";
import { getUserGroups, listGroups } from "./data";

export const loadGroups = cache(async (options: { spaceId?: string } = {}) => {
  return listGroups(options);
});

export const loadUserGroups = cache(async ({ userId }: { userId: string }) => {
  return getUserGroups({ userId });
});
