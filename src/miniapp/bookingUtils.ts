import type { AvailableSlot, BookingDate, BusySlot } from "./bookingTypes";

export function getNextSevenDays(): BookingDate[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);

    return {
      value: toDateValue(date),
      weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(
        date
      ),
      label: new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short"
      }).format(date),
      shortLabel: new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short"
      }).format(date)
    };
  });
}

export function isBusySlot(busySlots: BusySlot[], date: string, time: string) {
  return busySlots.some((slot) => slot.date === date && slot.time === time);
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(`${value}T12:00:00`));
}

export function getNearestAvailableSlots({
  dates,
  timeSlots,
  busySlots,
  selectedDate,
  limit
}: {
  dates: BookingDate[];
  timeSlots: string[];
  busySlots: BusySlot[];
  selectedDate: string;
  limit: number;
}): AvailableSlot[] {
  const selectedIndex = Math.max(
    dates.findIndex((date) => date.value === selectedDate),
    0
  );

  return dates
    .slice(selectedIndex)
    .flatMap((date) =>
      timeSlots.map((time) => ({
        date: date.value,
        time,
        shortDate: date.shortLabel
      }))
    )
    .filter((slot) => !isBusySlot(busySlots, slot.date, slot.time))
    .slice(0, limit);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
