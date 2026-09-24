"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { setPollMuted, togglePollPinned } from "@/features/poll/mutations";
import { setPollMutedSchema } from "@/features/poll/schema";
import { identifyGroup } from "@/lib/posthog";
import { authActionClient } from "@/lib/safe-action/server";

export const setPollMutedAction = authActionClient
  .metadata({ actionName: "set_poll_muted" })
  .inputSchema(setPollMutedSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { pollId, muted } = parsedInput;

    const result = await setPollMuted({
      pollId,
      userId: ctx.user.id,
      muted,
    });

    if (result.ok) {
      identifyGroup({
        groupType: "poll",
        groupKey: pollId,
        properties: {
          muted,
        },
      });
    }

    return result;
  });

export const togglePollPinnedAction = authActionClient
  .metadata({ actionName: "toggle_poll_pinned" })
  .inputSchema(
    z.object({
      pollId: z.string(),
      pinned: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { pollId, pinned } = parsedInput;

    await togglePollPinned({
      pollId,
      pinned,
    });

    revalidatePath("/");
    revalidatePath("/polls");
    revalidatePath(`/poll/${pollId}`);
    return { ok: true, pinned };
  });
