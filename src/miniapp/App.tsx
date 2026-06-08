import { FormEvent, useEffect, useMemo, useState } from "react";
import WebApp from "@twa-dev/sdk";

import { submitBooking, fetchBusySlots, type BusySlot } from "./api";
import { BookingSummary } from "./components/BookingSummary";
import { StepLayout } from "./components/StepLayout";
import {
  getNextSevenDays,
  getNearestAvailableSlots,
  isBusySlot
} from "./bookingUtils";
import { lessonTypes, timeSlots } from "./bookingData";
import type { BookingForm, BookingStep } from "./bookingTypes";
import "./styles.css";

const steps: BookingStep[] = [
  "welcome",
  "lesson",
  "date",
  "time",
  "contacts",
  "confirm",
  "success"
];

const initialForm: BookingForm = {
  studentName: "",
  phone: "",
  comment: ""
};

export function App() {
  const [step, setStep] = useState<BookingStep>("welcome");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);

  const dates = useMemo(() => getNextSevenDays(), []);
  const selectedLesson = lessonTypes.find(
    (lesson) => lesson.id === selectedLessonId
  );
  const stepIndex = steps.indexOf(step);
  const selectedDateBusySlots = busySlots.filter(
    (slot) => slot.date === selectedDate
  );
  const alternatives = getNearestAvailableSlots({
    dates,
    timeSlots,
    busySlots,
    selectedDate,
    limit: 3
  });

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    fetchBusySlots().then(setBusySlots).catch(() => {});
  }, []);

  function goTo(nextStep: BookingStep) {
    setErrors({});
    setSubmitError(null);
    setStep(nextStep);
  }

  async function handleSubmitBooking() {
    if (!selectedLessonId || !selectedDate || !selectedTime || !selectedLesson) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitBooking({
        studentName: form.studentName,
        phone: form.phone,
        lessonType: selectedLesson.title,
        date: selectedDate,
        time: selectedTime,
        comment: form.comment || undefined,
        telegramUserId: WebApp.initDataUnsafe.user?.id
      });
      goTo("success");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    goTo(steps[Math.max(stepIndex - 1, 0)]);
  }

  function updateForm(field: keyof BookingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateContacts() {
    const nextErrors: Partial<Record<keyof BookingForm, string>> = {};

    if (!form.studentName.trim()) {
      nextErrors.studentName = "Укажите имя ученика";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Укажите телефон";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitContacts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedLessonId || !selectedDate || !selectedTime) {
      return;
    }

    if (validateContacts()) {
      goTo("confirm");
    }
  }

  function resetFlow() {
    setSelectedLessonId("");
    setSelectedDate("");
    setSelectedTime("");
    setForm(initialForm);
    setErrors({});
    setSubmitError(null);
    setStep("welcome");
  }

  return (
    <main className="app-shell">
      <section className="booking-panel" aria-live="polite">
        <header className="app-header">
          <div>
            <p className="eyebrow">Telegram Mini App</p>
            <h1>TutorBook Mini CRM</h1>
          </div>
          <span className="step-counter">
            {step === "success" ? "Готово" : `${stepIndex + 1}/6`}
          </span>
        </header>

        {step !== "success" && (
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${Math.min((stepIndex / 5) * 100, 100)}%` }} />
          </div>
        )}

        {step === "welcome" && (
          <StepLayout
            eyebrow="Онлайн-запись"
            title="Запись на занятие по английскому языку"
            description="Выберите формат урока, удобный день и время. Репетитор подтвердит заявку в Telegram."
            footer={
              <button
                className="primary-button"
                type="button"
                onClick={() => goTo("lesson")}
              >
                Начать запись
              </button>
            }
          >
            <div className="info-note">
              Оплата — напрямую репетитору (обычно перевод на карту).
              Запись через это приложение бесплатна.
            </div>
          </StepLayout>
        )}

        {step === "lesson" && (
          <StepLayout
            eyebrow="Шаг 1"
            title="Выберите тип занятия"
            description="Выберите формат занятия."
            footer={
              <StepActions
                onBack={goBack}
                onNext={() => goTo("date")}
                nextDisabled={!selectedLessonId}
              />
            }
          >
            <div className="option-list">
              {lessonTypes.map((lesson) => (
                <button
                  className={
                    lesson.id === selectedLessonId
                      ? "choice-card selected"
                      : "choice-card"
                  }
                  key={lesson.id}
                  type="button"
                  onClick={() => setSelectedLessonId(lesson.id)}
                >
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.duration}</small>
                  </span>
                  <span className="choice-marker" aria-hidden="true" />
                </button>
              ))}
            </div>
          </StepLayout>
        )}

        {step === "date" && (
          <StepLayout
            eyebrow="Шаг 2"
            title="Выберите дату"
            description="Доступны ближайшие 7 дней."
            footer={
              <StepActions
                onBack={goBack}
                onNext={() => goTo("time")}
                nextDisabled={!selectedDate}
              />
            }
          >
            <div className="date-grid">
              {dates.map((date) => (
                <button
                  className={
                    date.value === selectedDate
                      ? "date-button selected"
                      : "date-button"
                  }
                  key={date.value}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date.value);
                    setSelectedTime("");
                  }}
                >
                  <span>{date.weekday}</span>
                  <strong>{date.label}</strong>
                </button>
              ))}
            </div>
          </StepLayout>
        )}

        {step === "time" && (
          <StepLayout
            eyebrow="Шаг 3"
            title="Выберите время"
            description="Занятые слоты видны, но недоступны для выбора."
            footer={
              <StepActions
                onBack={goBack}
                onNext={() => goTo("contacts")}
                nextDisabled={!selectedTime}
              />
            }
          >
            <div className="time-grid">
              {timeSlots.map((time) => {
                const disabled = isBusySlot(busySlots, selectedDate, time);

                return (
                  <button
                    className={
                      time === selectedTime
                        ? "time-button selected"
                        : "time-button"
                    }
                    disabled={disabled}
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                  >
                    <span>{time}</span>
                    {disabled && <small>занято</small>}
                  </button>
                );
              })}
            </div>

            {selectedDateBusySlots.length > 0 && (
              <div className="alternatives">
                <p>Ближайшие свободные варианты</p>
                <div className="alternative-list">
                  {alternatives.map((slot) => (
                    <button
                      key={`${slot.date}-${slot.time}`}
                      type="button"
                      onClick={() => {
                        setSelectedDate(slot.date);
                        setSelectedTime(slot.time);
                      }}
                    >
                      <span>{slot.shortDate}</span>
                      <strong>{slot.time}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </StepLayout>
        )}

        {step === "contacts" && (
          <form className="step-screen" onSubmit={submitContacts}>
            <StepLayout
              eyebrow="Шаг 4"
              title="Контактные данные"
              description="Нужны только данные для подтверждения записи."
              footer={<StepActions onBack={goBack} nextLabel="Проверить" />}
            >
              <label className="field">
                <span>Имя ученика</span>
                <input
                  autoComplete="name"
                  name="studentName"
                  onChange={(event) =>
                    updateForm("studentName", event.target.value)
                  }
                  placeholder="Например, Анна"
                  value={form.studentName}
                />
                {errors.studentName && (
                  <small className="field-error">{errors.studentName}</small>
                )}
              </label>
              <label className="field">
                <span>Телефон</span>
                <input
                  autoComplete="tel"
                  inputMode="tel"
                  name="phone"
                  onChange={(event) => updateForm("phone", event.target.value)}
                  placeholder="+7..."
                  value={form.phone}
                />
                {errors.phone && (
                  <small className="field-error">{errors.phone}</small>
                )}
              </label>
              <label className="field">
                <span>Комментарий</span>
                <textarea
                  name="comment"
                  onChange={(event) => updateForm("comment", event.target.value)}
                  placeholder="Цель занятий, уровень или удобный способ связи"
                  rows={3}
                  value={form.comment}
                />
              </label>
            </StepLayout>
          </form>
        )}

        {step === "confirm" && selectedLesson && (
          <StepLayout
            eyebrow="Шаг 5"
            title="Проверьте заявку"
            description="Нажмите «Отправить заявку» — преподаватель получит уведомление в Telegram."
            footer={
              <>
                {submitError && (
                  <p className="field-error" style={{ textAlign: "center" }}>
                    {submitError}
                  </p>
                )}
                <StepActions
                  onBack={goBack}
                  onNext={handleSubmitBooking}
                  nextDisabled={submitting}
                  nextLabel={submitting ? "Отправка…" : "Отправить заявку"}
                />
              </>
            }
          >
            <BookingSummary
              comment={form.comment}
              date={selectedDate}
              lesson={selectedLesson}
              phone={form.phone}
              studentName={form.studentName}
              time={selectedTime}
            />
          </StepLayout>
        )}

        {step === "success" && (
          <StepLayout
            eyebrow="Заявка принята"
            title="Заявка на занятие отправлена."
            description="Репетитор подтвердит запись в Telegram."
            footer={
              <button className="primary-button" type="button" onClick={resetFlow}>
                Новая заявка
              </button>
            }
          >
            <div className="success-box">
              <strong>Готово</strong>
              <span>Заявка отправлена репетитору.</span>
            </div>
          </StepLayout>
        )}
      </section>
    </main>
  );
}

function StepActions({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Далее"
}: {
  onBack: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="actions">
      <button className="secondary-button" type="button" onClick={onBack}>
        Назад
      </button>
      <button
        className="primary-button"
        disabled={nextDisabled}
        onClick={onNext}
        type={onNext ? "button" : "submit"}
      >
        {nextLabel}
      </button>
    </div>
  );
}
