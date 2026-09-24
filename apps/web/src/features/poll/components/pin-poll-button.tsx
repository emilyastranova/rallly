"use client";

import { Button } from "@rallly/ui/button";
import { toast } from "@rallly/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rallly/ui/tooltip";
import { PinIcon } from "lucide-react";
import React from "react";
import { togglePollPinnedAction } from "@/features/poll/actions";
import { usePoll } from "@/features/poll/client";
import { useSafeAction } from "@/lib/safe-action/client";

export function PinPollButton() {
  const poll = usePoll();
  const [pinned, setPinned] = React.useState(Boolean(poll?.pinned));
  const togglePin = useSafeAction(togglePollPinnedAction);

  const handleToggle = async () => {
    const nextPinned = !pinned;
    setPinned(nextPinned);
    await togglePin.executeAsync({
      pollId: poll.id,
      pinned: nextPinned,
    });
    toast.success(
      nextPinned ? "Poll pinned to Home tab" : "Poll unpinned from Home tab",
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="default"
            size="icon"
            aria-label={pinned ? "Unpin from Home" : "Pin to Home"}
            onClick={handleToggle}
            disabled={togglePin.isExecuting}
            className="size-8"
          >
            <PinIcon
              className={`size-4 ${
                pinned ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </Button>
        }
      />
      <TooltipContent>
        {pinned ? "Unpin from Home" : "Pin to Home"}
      </TooltipContent>
    </Tooltip>
  );
}
