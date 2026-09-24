import type * as React from "react";

import type { PollOptionProps } from "./poll-option";
import PollOption from "./poll-option";

export interface DateOptionProps extends PollOptionProps {
  dow: string;
  day: string;
  month: string;
  title?: string | null;
}

const DateOption: React.FunctionComponent<DateOptionProps> = ({
  dow,
  day,
  title,
  ...rest
}) => {
  return (
    <PollOption {...rest}>
      {title ? (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">{title}</span>
          <span className="text-muted-foreground text-xs">
            {day} {dow}
          </span>
        </div>
      ) : (
        <div className="text-sm">
          {day} {dow}
        </div>
      )}
    </PollOption>
  );
};

export default DateOption;
