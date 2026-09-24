import type {
  DateTimeOption,
  TimeOption,
} from "@/features/poll/components/forms/poll-options-form/types";
import { dayjs } from "@/lib/dayjs";

export function getBrowserTimeZone() {
  return dayjs.tz.guess();
}

export const encodeDateOption = (option: DateTimeOption) => {
  return option.type === "timeSlot"
    ? `${option.start}/${option.end}`
    : option.date;
};

export interface ParsedDateOption {
  type: "date";
  optionId: string;
  day: string;
  dow: string;
  month: string;
  year: string;
  title?: string | null;
}

export interface ParsedTimeSlotOption {
  type: "timeSlot";
  optionId: string;
  day: string;
  dow: string;
  month: string;
  startTime: string;
  endTime: string;
  duration: string;
  year: string;
  title?: string | null;
}

export type ParsedDateTimeOpton = ParsedDateOption | ParsedTimeSlotOption;

export const getOptionDateTimeLabel = (option: ParsedDateTimeOpton) => {
  const date = `${option.dow} ${option.day} ${option.month} ${option.year}`;
  const base =
    option.type === "timeSlot"
      ? `${date}, ${option.startTime} – ${option.endTime}`
      : date;
  return option.title ? `${option.title} (${base})` : base;
};

export const removeAllOptionsForDay = (
  options: DateTimeOption[],
  date: Date,
) => {
  return options.filter((option) => {
    return !dayjs(date).isSame(
      option.type === "date" ? option.date : option.start,
      "day",
    );
  });
};

export const expectTimeOption = (d: DateTimeOption): TimeOption => {
  if (d.type === "date") {
    throw new Error("Expected timeSlot but got date instead");
  }
  return d;
};
