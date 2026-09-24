import type * as React from "react";

import type { PollOptionProps } from "./poll-option";
import PollOption from "./poll-option";

export interface TimeSlotOptionProps extends PollOptionProps {
  startTime: string;
  endTime: string;
  duration: string;
  title?: string | null;
}

const meridiem = (time: string) => /(AM|PM)$/.exec(time)?.[0];

const TimeSlotOption: React.FunctionComponent<TimeSlotOptionProps> = ({
  startTime,
  endTime,
  title,
  ...rest
}) => {
  const startLabel =
    meridiem(startTime) && meridiem(startTime) === meridiem(endTime)
      ? startTime.replace(/ (AM|PM)$/, "")
      : startTime;

  return (
    <PollOption {...rest}>
      {title ? (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">{title}</span>
          <span className="text-muted-foreground text-xs">
            {startLabel} – {endTime}
          </span>
        </div>
      ) : (
        <div className="text-sm">
          {startLabel} – {endTime}
        </div>
      )}
    </PollOption>
  );
};

export default TimeSlotOption;
