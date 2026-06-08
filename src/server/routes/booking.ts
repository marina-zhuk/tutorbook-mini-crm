import { Router } from "express";

import {
  sendBookingToGoogleScript,
  type GoogleScriptBookingPayload
} from "../services/googleScriptService.js";

type BookingBody = GoogleScriptBookingPayload & { telegramUserId?: number };

const REQUIRED_FIELDS: (keyof GoogleScriptBookingPayload)[] = [
  "studentName",
  "phone",
  "lessonType",
  "date",
  "time"
];

function formatAdminMessage(payload: GoogleScriptBookingPayload): string {
  const lines = [
    "📚 Новая заявка на занятие",
    "",
    `👤 Ученик: ${payload.studentName}`,
    `📞 Телефон: ${payload.phone}`,
    `📖 Урок: ${payload.lessonType}`,
    `📅 Дата: ${payload.date}`,
    `⏰ Время: ${payload.time}`
  ];

  if (payload.comment) {
    lines.push(`💬 Комментарий: ${payload.comment}`);
  }

  return lines.join("\n");
}

export function createBookingRouter(
  notifyAdmin: (message: string, extra?: Record<string, unknown>) => Promise<void>
) {
  const router = Router();

  router.post("/booking", async (req, res) => {
    const body = req.body as Partial<BookingBody>;

    const missing = REQUIRED_FIELDS.filter((field) => !body[field]?.trim());
    if (missing.length > 0) {
      res.status(400).json({ ok: false, error: `Missing fields: ${missing.join(", ")}` });
      return;
    }

    const payload: GoogleScriptBookingPayload = {
      studentName: body.studentName!.trim(),
      phone: body.phone!.trim(),
      lessonType: body.lessonType!.trim(),
      date: body.date!.trim(),
      time: body.time!.trim(),
      comment: body.comment?.trim()
    };

    const telegramUserId = body.telegramUserId;

    sendBookingToGoogleScript(payload).catch((err: unknown) => {
      console.error("Google Script sync failed:", err instanceof Error ? err.message : err);
    });

    const extra: Record<string, unknown> | undefined = telegramUserId
      ? {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Подтвердить",
                  callback_data: `confirm:${telegramUserId}:${payload.studentName}:${payload.date}:${payload.time}`
                },
                {
                  text: "❌ Отменить",
                  callback_data: `reject:${telegramUserId}:${payload.studentName}`
                }
              ]
            ]
          }
        }
      : undefined;

    try {
      await notifyAdmin(formatAdminMessage(payload), extra);
    } catch (err: unknown) {
      console.error("Telegram notify failed:", err instanceof Error ? err.message : err);
    }

    res.json({ ok: true });
  });

  return router;
}
