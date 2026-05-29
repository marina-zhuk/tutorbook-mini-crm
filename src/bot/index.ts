import { Markup, Telegraf } from "telegraf";

const BOOKING_BUTTON_TEXT = "Записаться на занятие";

function createBookingButton(miniAppUrl: string) {
  if (miniAppUrl.startsWith("https://")) {
    return Markup.button.webApp(BOOKING_BUTTON_TEXT, miniAppUrl);
  }

  return Markup.button.url(BOOKING_BUTTON_TEXT, miniAppUrl);
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
