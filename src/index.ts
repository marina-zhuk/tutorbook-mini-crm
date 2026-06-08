import "dotenv/config";

import { startBot } from "./bot/index.js";
import { startServer } from "./server/index.js";

const bot = await startBot();

const adminChatId = process.env.ADMIN_CHAT_ID;

const notifyAdmin =
  bot && adminChatId
    ? async (message: string, extra?: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await bot.telegram.sendMessage(adminChatId, message, extra as any);
      }
    : undefined;

if (bot && !adminChatId) {
  console.warn("ADMIN_CHAT_ID is not set — booking notifications will not be sent.");
}

const server = startServer({ notifyAdmin });

function shutdown(signal: "SIGINT" | "SIGTERM") {
  bot?.stop(signal);
  server.close(() => {
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
