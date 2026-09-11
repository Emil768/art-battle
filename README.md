# Art Battle

Мультиплеерная игра: 5 игроков получают одну референс-картинку, 2 минуты рисуют её (в canvas или фото с бумаги),
голосуют друг за друга лайк/дизлайк, победитель получает XP, а результат раунда постится в Telegram-группу.

## Стек

Next.js (App Router) + Socket.io (через кастомный `server.ts`) + Supabase (Postgres/Auth/Storage) + Telegram Bot API.

Socket.io требует постоянно живущий процесс, поэтому `dev`/`start` запускают `server.ts` через `tsx`, а не `next dev`/`next start`.
Это значит: деплой — самостоятельный Node-процесс (Docker/VPS/Fly.io/Railway), **не** Vercel serverless.

## Настройка перед первым запуском

1. Скопировать `.env.example` в `.env.local` и заполнить все переменные (см. ниже, что где взять).
2. Применить `supabase/migrations/0001_init.sql` к своему Supabase-проекту (SQL Editor в дашборде или `supabase db push`).
3. Создать в Supabase Storage два бакета: `reference-images` (публичный) и `submissions` (приватный).
4. Загрузить в `reference-images` 5-10 картинок и добавить на них строки в таблицу `reference_images`
   (`url` = публичный URL картинки, `is_active = true`) — см. `supabase/seed/reference_images.sql`.
5. Включить Google как провайдера в Supabase Auth → Providers.
6. Создать Telegram-бота и добавить его в группу.

```bash
npm install
npm run dev
```

## Переменные окружения

| Переменная | Где взять |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key (секретный, не для фронта) |
| `TELEGRAM_BOT_TOKEN` | Telegram → @BotFather → `/newbot` → выдаст токен |
| `TELEGRAM_CHAT_ID` | ID группы, куда постить результаты (см. инструкцию ниже) |
| `ROOM_SIZE` | Кол-во игроков в комнате (по умолчанию 5, для локального теста можно поставить 2) |
| `DRAWING_SECONDS` | Время на рисование, по умолчанию 120 (2 минуты) |
| `VOTING_SECONDS` | Время на голосование, по умолчанию 120 (2 минуты) |
| `WIN_XP_POOL` | XP за победу, делится поровну между победителями при ничьей (по умолчанию 100) |
| `PARTICIPATION_XP` | XP за участие без победы (по умолчанию 10) |
