import "dotenv/config";

import { startBot } from "./bot/index.js";
import { startServer } from "./server/index.js";

const server = startServer();
const bot = await startBot();

function shutdown(signal: "SIGINT" | "SIGTERM") {
  bot?.stop(signal);
  server.close(() => {
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
