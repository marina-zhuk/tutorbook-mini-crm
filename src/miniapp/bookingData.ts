import type { LessonType } from "./bookingTypes";

export const lessonTypes: LessonType[] = [
  { id: "trial", title: "Пробное занятие", duration: "30 минут" },
  { id: "individual", title: "Индивидуальный урок", duration: "60 минут" },
  { id: "speaking", title: "Разговорная практика", duration: "45 минут" },
  { id: "exam", title: "Подготовка к экзамену", duration: "60 минут" }
];

export const timeSlots = ["10:00", "12:00", "14:00", "16:00", "18:00"];
