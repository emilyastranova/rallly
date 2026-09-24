"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getActiveSpaceForUser } from "@/features/space/data";
import { AppError } from "@/lib/errors/app-error";
import { authActionClient } from "@/lib/safe-action/server";
import { createGroup, deleteGroup, updateUserGroups } from "./mutations";

export const createGroupAction = authActionClient
  .metadata({ actionName: "create_group" })
  .inputSchema(
    z.object({
      name: z.string().trim().min(1, "Name is required"),
      description: z.string().optional(),
      spaceId: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const group = await createGroup({
      name: parsedInput.name,
      description: parsedInput.description,
      spaceId: parsedInput.spaceId,
    });

    revalidatePath("/settings/groups");
    revalidatePath("/settings/profile");
    return { group };
  });

export const deleteGroupAction = authActionClient
  .metadata({ actionName: "delete_group" })
  .inputSchema(
    z.object({
      groupId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await deleteGroup({
      groupId: parsedInput.groupId,
    });

    revalidatePath("/settings/groups");
    revalidatePath("/settings/profile");
    return { success: true };
  });

export const updateUserGroupsAction = authActionClient
  .metadata({ actionName: "update_user_groups" })
  .inputSchema(
    z.object({
      primaryGroupId: z.string().nullable().optional(),
      groupIds: z.array(z.string()).default([]),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    await updateUserGroups({
      userId: ctx.user.id,
      primaryGroupId: parsedInput.primaryGroupId,
      groupIds: parsedInput.groupIds,
    });

    revalidatePath("/settings/profile");
    return { success: true };
  });

export const adminAssignUserGroupsAction = authActionClient
  .metadata({ actionName: "admin_assign_user_groups" })
  .inputSchema(
    z.object({
      targetUserId: z.string(),
      primaryGroupId: z.string().nullable().optional(),
      groupIds: z.array(z.string()).default([]),
      spaceId: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    if (parsedInput.spaceId) {
      const activeSpace = await getActiveSpaceForUser(ctx.user.id);
      const isSpaceAdmin =
        activeSpace?.id === parsedInput.spaceId && activeSpace.role === "admin";
      const isInstanceAdmin = ctx.user.role === "admin";
      if (!isSpaceAdmin && !isInstanceAdmin) {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only space admins can assign members to groups",
        });
      }
    }

    await updateUserGroups({
      userId: parsedInput.targetUserId,
      primaryGroupId: parsedInput.primaryGroupId,
      groupIds: parsedInput.groupIds,
    });

    revalidatePath("/settings/groups");
    revalidatePath("/members");
    revalidatePath("/settings/profile");
    return { success: true };
  });
