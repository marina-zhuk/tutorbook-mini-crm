# TutorBook Mini CRM

Telegram Mini App + бот + Vercel backend для записи на занятия по английскому.

## Live / repo

- **Live demo:** https://tutorbook-mini-crm.vercel.app
- **GitHub:** https://github.com/marina-zhuk/tutorbook-mini-crm
- **Portfolio case:** [docs/PORTFOLIO_CASE.md](docs/PORTFOLIO_CASE.md)
- **Client brief:** [docs/CLIENT_BRIEF.md](docs/CLIENT_BRIEF.md)
- **Demo flow:** [docs/DEMO_FLOW.md](docs/DEMO_FLOW.md)

## Стек

- **Frontend**: React + Vite → Vercel static
- **API**: Vercel Serverless Functions (TypeScript)
- **Bot**: Telegraf, Vercel webhook (prod) / polling (dev)
- **Storage**: Google Sheets через Google Apps Script
- **Notifications**: Telegram Bot API

## Архитектура (продакшн)

```
Ученик → Telegram Bot → Mini App (Vercel)
                              ↓
                    POST /api/booking
                              ↓
              ┌───────────────┴────────────────┐
              ↓                                ↓
      Google Sheets                   Telegram notification
      (conflict check,                (admin gets ✅/❌ buttons)
       save row)                              ↓
                                  Admin taps button
                                              ↓
                                  POST /api/bot (webhook)
                                              ↓
                                  Ученик получает уведомление
```

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота от BotFather |
| `ADMIN_CHAT_ID` | Telegram chat ID преподавателя |
| `MINIAPP_URL` | URL Mini App на Vercel |
| `GOOGLE_SCRIPT_URL` | URL задеплоенного Google Apps Script |
| `WEBHOOK_SECRET` | Секрет для верификации Telegram webhook |
| `PORT` | Порт для локального Express-сервера (default: 3000) |

## Google Apps Script — настройка

1. Открыть [script.google.com](https://script.google.com), создать новый проект
2. Вставить код из `google-script/Code.gs`
3. **Развернуть** → **Новое развёртывание** → Тип: **Веб-приложение**
   - Запускать от имени: **Меня**
   - Доступ: **Все**
4. Скопировать URL и вставить в `GOOGLE_SCRIPT_URL` (Vercel + `.env`)

Скрипт автоматически создаёт лист «Записи» с заголовками при первой записи и проверяет конфликты слотов.

## Запуск локально

```bash
npm install
cp .env.example .env   # заполнить переменные
npm run dev            # бот (polling) + Express на PORT
npm run dev:miniapp    # Vite dev server с proxy на localhost
```

## Сборка и деплой

```bash
npm run build          # TypeScript + Vite
vercel --prod          # деплой на Vercel
npm run setup:webhook  # зарегистрировать Telegram webhook
```

## Локальная разработка vs продакшн

| | Dev (`npm run dev`) | Prod (Vercel) |
|---|---|---|
| Bot | Polling (Telegraf) | Webhook (`/api/bot`) |
| API | Express `/api/booking` | Serverless `/api/booking` |
| Slots | `GET /api/slots` → Google Script | `GET /api/slots` → Google Script |
| Mini App | Vite dev server | Vercel static |

## Флоу записи

1. Ученик нажимает «Записаться на занятие» → открывается Mini App
2. Выбирает тип урока, дату, время (серые = уже заняты), вводит данные
3. Отправляет заявку → `/api/booking` проверяет конфликт в Google Sheets
4. Если слот занят → ошибка «Это время уже занято»
5. Иначе: строка добавлена в Sheets, преподаватель получает уведомление с кнопками
6. Преподаватель нажимает ✅/❌ → ученик получает уведомление в Telegram
