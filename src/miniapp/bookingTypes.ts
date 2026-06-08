export type BookingStep =
  | "welcome"
  | "lesson"
  | "date"
  | "time"
  | "contacts"
  | "confirm"
  | "success";

export type LessonType = {
  id: string;
  title: string;
  duration: string;
};

export type BookingForm = {
  studentName: string;
  phone: string;
  comment: string;
};

export type BookingDate = {
  value: string;
  weekday: string;
  label: string;
  shortLabel: string;
};

export type BusySlot = {
  date: string;
  time: string;
};

export type AvailableSlot = {
  date: string;
  time: string;
  shortDate: string;
};
