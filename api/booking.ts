import type { VercelRequest, VercelResponse } from "@vercel/node";

type BookingPayload = {
  studentName: string;
  phone: string;
  lessonType: string;
  date: string;
  time: string;
  comment?: string;
  telegramUserId?: number;
};

const REQUIRED_FIELDS: (keyof BookingPayload)[] = [
  "studentName",
  "phone",
  "lessonType",
  "date",
  "time"
];

async function sendToGoogleScript(payload: BookingPayload): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) return { ok: true };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return (await res.json()) as { ok: boolean; error?: string };
}

async function notifyAdmin(payload: BookingPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    "📚 Новая заявка на занятие",
    "",
    `👤 Ученик: ${payload.studentName}`,
    `📞 Телефон: ${payload.phone}`,
    `📖 Урок: ${payload.lessonType}`,
    `📅 Дата: ${payload.date}`,
    `⏰ Время: ${payload.time}`
  ];
  if (payload.comment) lines.push(`💬 Комментарий: ${payload.comment}`);
  const text = lines.join("\n");

  const body: Record<string, unknown> = { chat_id: chatId, text };

  if (payload.telegramUserId) {
    const uid = payload.telegramUserId;
    const name = payload.studentName;
    const date = payload.date;
    const time = payload.time;

    body.reply_markup = {
      inline_keyboard: [
        [
          {
            text: "✅ Подтвердить",
            callback_data: `confirm:${uid}:${name}:${date}:${time}`
          },
          {
            text: "❌ Отменить",
            callback_data: `reject:${uid}:${name}`
          }
        ]
      ]
    };
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as Partial<BookingPayload>;
  const missing = REQUIRED_FIELDS.filter((f) => !body[f]?.toString().trim());
  if (missing.length > 0) {
    return res.status(400).json({ ok: false, error: `Missing fields: ${missing.join(", ")}` });
  }

  const payload: BookingPayload = {
    studentName: body.studentName!.trim(),
    phone: body.phone!.trim(),
    lessonType: body.lessonType!.trim(),
    date: body.date!.trim(),
    time: body.time!.trim(),
    comment: body.comment?.trim(),
    telegramUserId: body.telegramUserId
  };

  const scriptResult = await sendToGoogleScript(payload).catch((): { ok: boolean; error?: string } => ({ ok: true }));

  if (!scriptResult.ok && scriptResult.error === "slot_taken") {
    return res.status(409).json({ ok: false, error: "Это время уже занято. Выберите другой слот." });
  }

  notifyAdmin(payload).catch((err: unknown) => {
    console.error("Telegram notify failed:", err instanceof Error ? err.message : err);
  });

  return res.status(200).json({ ok: true });
}
