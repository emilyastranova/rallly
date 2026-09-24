export type DateOption = {
  type: "date";
  date: string;
  title?: string;
};

export type TimeOption = {
  type: "timeSlot";
  start: string;
  end: string;
  title?: string;
};

export type DateTimeOption = DateOption | TimeOption;

export interface DateTimePickerProps {
  title?: string;
  options: DateTimeOption[];
  date?: Date;
  onNavigate: (date: Date) => void;
  onChange: (options: DateTimeOption[]) => void;
  duration: number;
  onChangeDuration: (duration: number) => void;
  scrollToTime?: Date;
}
