import { formatLongDate } from "../bookingUtils";
import type { LessonType } from "../bookingTypes";

export function BookingSummary({
  lesson,
  date,
  time,
  studentName,
  phone,
  comment
}: {
  lesson: LessonType;
  date: string;
  time: string;
  studentName: string;
  phone: string;
  comment: string;
}) {
  return (
    <dl className="summary-list">
      <SummaryItem label="Занятие" value={lesson.title} />
      <SummaryItem label="Длительность" value={lesson.duration} />
      <SummaryItem label="Дата" value={formatLongDate(date)} />
      <SummaryItem label="Время" value={time} />
      <SummaryItem label="Имя" value={studentName} />
      <SummaryItem label="Телефон" value={phone} />
      {comment.trim() && <SummaryItem label="Комментарий" value={comment} />}
    </dl>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
