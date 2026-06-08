import { Markup, Telegraf } from "telegraf";

const BOOKING_BUTTON_TEXT = "Записаться на занятие";

function createBookingButton(miniAppUrl: string) {
  if (miniAppUrl.startsWith("https://")) {
    return Markup.button.webApp(BOOKING_BUTTON_TEXT, miniAppUrl);
  }
  return Markup.button.url(BOOKING_BUTTON_TEXT, miniAppUrl);
}

async function tgCall(token: string, method: string, body: Record<string, unknown>): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export function createBot(token: string) {
  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    const miniAppUrl = process.env.MINIAPP_URL;

    if (!miniAppUrl) {
      await ctx.reply(
        "TutorBook Mini CRM готовится к запуску. MINIAPP_URL пока не настроен."
      );
      return;
    }

    await ctx.reply(
      "TutorBook Mini CRM помогает быстро записаться на занятие по английскому языку. Открой Mini App, выбери удобный формат и отправь заявку преподавателю.",
      Markup.inlineKeyboard([createBookingButton(miniAppUrl)])
    );
  });

  bot.on("callback_query", async (ctx) => {
    const data = (ctx.callbackQuery as { data?: string }).data ?? "";
    const adminChatId = ctx.callbackQuery.from.id;
    const messageId = (ctx.callbackQuery.message as { message_id: number }).message_id;

    if (data.startsWith("confirm:")) {
      const parts = data.split(":");
      const studentId = Number(parts[1]);
      const studentName = parts[2];
      const date = parts[3];
      const time = parts[4];

      await ctx.answerCbQuery();
      await Promise.all([
        tgCall(token, "editMessageText", {
          chat_id: adminChatId,
          message_id: messageId,
          text: `✅ Подтверждено — ${studentName}\n📅 ${date} ⏰ ${time}`
        }),
        tgCall(token, "sendMessage", {
          chat_id: studentId,
          text: `✅ Ваша запись подтверждена!\n\n📅 Дата: ${date}\n⏰ Время: ${time}\n\nДо встречи!`
        })
      ]);
    } else if (data.startsWith("reject:")) {
      const parts = data.split(":");
      const studentId = Number(parts[1]);
      const studentName = parts[2];

      await ctx.answerCbQuery();
      await Promise.all([
        tgCall(token, "editMessageText", {
          chat_id: adminChatId,
          message_id: messageId,
          text: `❌ Отменено — ${studentName}`
        }),
        tgCall(token, "sendMessage", {
          chat_id: studentId,
          text: "❌ К сожалению, ваша запись отменена. Напишите преподавателю напрямую, чтобы выбрать другое время."
        })
      ]);
    }
  });

  return bot;
}

export async function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn("Telegram bot is not started: TELEGRAM_BOT_TOKEN is missing.");
    return null;
  }

  const bot = createBot(token);
  try {
    await bot.launch();
    console.log("Telegram bot is running.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Telegram bot is not started: ${message}`);
    return null;
  }

  return bot;
}
