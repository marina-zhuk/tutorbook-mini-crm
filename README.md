# TutorBook Mini CRM

Telegram Mini App + Telegram bot + Express backend foundation for booking English tutoring lessons.

## Stack

- Node.js
- TypeScript
- Express
- Telegraf
- React
- Vite
- Telegram WebApp SDK
- dotenv

## Current Stage

Initial foundation:

- Express backend with health/status endpoints.
- Telegram bot with `/start` and a Web App button.
- React/Vite Mini App placeholder.
- Environment variable template.
- Google Apps Script service placeholder for future CRM sync.

Not implemented yet: booking logic, Google Apps Script POST sync, payments, admin status updates.

## Google Sheets Integration Note

Google Sheets will be connected later through a Google Apps Script Web App URL (`GOOGLE_SCRIPT_URL`). This project does not use Google Sheets API service account authentication, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, or `GOOGLE_SHEETS_SPREADSHEET_ID`.

## Project Structure

```txt
src/
  bot/       Telegram bot entrypoints and handlers
  server/    Express backend and future service integrations
  miniapp/   React Telegram Mini App
  shared/    Shared types/helpers when needed
```

## Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` locally with real values. Do not commit `.env` or real tokens.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from BotFather. Required to start the bot. |
| `ADMIN_CHAT_ID` | Future tutor/admin Telegram chat ID for notifications. |
| `MINIAPP_URL` | URL opened by the Telegram Web App button. Use public HTTPS for real Telegram testing. |
| `API_BASE_URL` | Backend API URL for the Mini App. |
| `GOOGLE_SCRIPT_URL` | Future Google Apps Script Web App URL for saving bookings to Google Sheets. |

## Run Locally

Backend + bot:

```bash
npm run dev
```

Mini App dev server:

```bash
npm run dev:miniapp
```

Health checks:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/status
```

If `TELEGRAM_BOT_TOKEN` is missing, the backend still starts and the bot is skipped.

## Build and Start

```bash
npm run typecheck
npm run build
npm start
```

## Next Steps

- Add Mini App booking form.
- Add backend booking endpoint.
- Send Telegram admin notifications.
- POST booking data to `GOOGLE_SCRIPT_URL`.
- Add tutor/admin status update flow.
