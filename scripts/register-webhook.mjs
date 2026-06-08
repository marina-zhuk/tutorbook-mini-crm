import "dotenv/config";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.WEBHOOK_SECRET;
const BASE_URL = process.env.MINIAPP_URL ?? "https://tutorbook-mini-crm.vercel.app";

if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is missing");
  process.exit(1);
}

const webhookUrl = `${BASE_URL}/api/bot`;
const params = new URLSearchParams({ url: webhookUrl });
if (SECRET) params.set("secret_token", SECRET);

const res = await fetch(
  `https://api.telegram.org/bot${TOKEN}/setWebhook?${params}`
);
const data = await res.json();

console.log("Webhook registered:", JSON.stringify(data, null, 2));

// Verify
const info = await fetch(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
const infoData = await info.json();
console.log("Webhook info:", JSON.stringify(infoData.result, null, 2));
