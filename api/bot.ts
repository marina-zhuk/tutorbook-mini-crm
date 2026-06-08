import type { VercelRequest, VercelResponse } from "@vercel/node";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const MINIAPP_URL = process.env.MINIAPP_URL ?? "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";

async function tgCall(method: string, body: Record<string, unknown>): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function handleStart(chatId: number): Promise<void> {
  await tgCall("sendMessage", {
    chat_id: chatId,
    text: "TutorBook Mini CRM помогает быстро записаться на занятие по английскому языку. Открой Mini App, выбери удобный формат и отправь заявку преподавателю.",
    reply_markup: {
      inline_keyboard: [[
        { text: "Записаться на занятие", web_app: { url: MINIAPP_URL } }
      ]]
    }
  });
}

async function handleConfirm(
  callbackQueryId: string,
  adminChatId: number,
  messageId: number,
  studentId: number,
  studentName: string,
  date: string,
  time: string
): Promise<void> {
  await Promise.all([
    tgCall("answerCallbackQuery", { callback_query_id: callbackQueryId }),
    tgCall("editMessageReplyMarkup", {
      chat_id: adminChatId,
      message_id: messageId,
      reply_markup: {}
    }),
    tgCall("editMessageText", {
      chat_id: adminChatId,
      message_id: messageId,
      text: `✅ Подтверждено — ${studentName}\n📅 ${date} ⏰ ${time}`
    }),
    tgCall("sendMessage", {
      chat_id: studentId,
      text: `✅ Ваша запись подтверждена!\n\n📅 Дата: ${date}\n⏰ Время: ${time}\n\nДо встречи!`
    })
  ]);
}

async function handleReject(
  callbackQueryId: string,
  adminChatId: number,
  messageId: number,
  studentId: number,
  studentName: string
): Promise<void> {
  await Promise.all([
    tgCall("answerCallbackQuery", { callback_query_id: callbackQueryId }),
    tgCall("editMessageReplyMarkup", {
      chat_id: adminChatId,
      message_id: messageId,
      reply_markup: {}
    }),
    tgCall("editMessageText", {
      chat_id: adminChatId,
      message_id: messageId,
      text: `❌ Отменено — ${studentName}`
    }),
    tgCall("sendMessage", {
      chat_id: studentId,
      text: "❌ К сожалению, ваша запись отменена. Напишите преподавателю напрямую, чтобы выбрать другое время."
    })
  ]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (WEBHOOK_SECRET && req.headers["x-telegram-bot-api-secret-token"] !== WEBHOOK_SECRET) {
    return res.status(403).end();
  }

  const update = req.body as Record<string, unknown>;

  try {
    if (update.message) {
      const msg = update.message as Record<string, unknown>;
      const text = (msg.text as string) ?? "";
      const chat = msg.chat as Record<string, unknown>;
      const chatId = chat.id as number;

      if (text.startsWith("/start")) {
        await handleStart(chatId);
      }
    }

    if (update.callback_query) {
      const cq = update.callback_query as Record<string, unknown>;
      const cqId = cq.id as string;
      const data = (cq.data as string) ?? "";
      const from = cq.from as Record<string, unknown>;
      const adminChatId = from.id as number;
      const msg = cq.message as Record<string, unknown>;
      const messageId = msg.message_id as number;

      if (data.startsWith("confirm:")) {
        // confirm:{studentId}:{name}:{date}:{time}
        const parts = data.split(":");
        const studentId = Number(parts[1]);
        const studentName = parts[2];
        const date = parts[3];
        const time = parts[4];
        await handleConfirm(cqId, adminChatId, messageId, studentId, studentName, date, time);
      } else if (data.startsWith("reject:")) {
        // reject:{studentId}:{name}
        const parts = data.split(":");
        const studentId = Number(parts[1]);
        const studentName = parts[2];
        await handleReject(cqId, adminChatId, messageId, studentId, studentName);
      }
    }
  } catch (err) {
    console.error("Bot webhook error:", err instanceof Error ? err.message : err);
  }

  return res.status(200).json({ ok: true });
}
