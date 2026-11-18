# Alina Moreau — photographer portfolio

Mobile-first продающий прототип портфолио фотографа в Париже и Нормандии. Включает три формата съёмки, адаптивную редакционную подачу и форму бронирования с доставкой заявок в Telegram.

## Локальный запуск

Требуется Node.js 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

Сайт и API откроются на `http://localhost:4173`.

Для Telegram создайте новый токен через BotFather. Не используйте токен, который когда-либо отправлялся в чат или попадал в историю репозитория. Заполните `TELEGRAM_BOT_TOKEN` и случайный `TELEGRAM_WEBHOOK_SECRET` в локальном `.env`.

## Telegram webhook

Заявки отправляются в chat ID `-1003887700261`. Callback-кнопки поддерживают статусы «Ответила», «Под вопросом» и двухшаговое удаление. Endpoint проверяет заголовок `X-Telegram-Bot-Api-Secret-Token`, chat ID и формат callback data.

После деплоя зарегистрируйте webhook с URL `https://your-domain.example/api/telegram/webhook` и передайте `TELEGRAM_WEBHOOK_SECRET` как `secret_token`. Секреты не коммитьте и не передавайте в URL публичных сервисов.

## Проверки и production preview

```bash
npm run lint
npm run typecheck
npm run build
npm run test:ui
npm run preview
```

Production preview также работает на `http://localhost:4173`.

## Основа и дизайн-процесс

Проект сохраняет React, Vite и TypeScript-основу шаблона [di-sukharev/vibe](https://github.com/di-sukharev/vibe). Для дизайн-аудита использованы принципы [Unslop](https://github.com/heydamir/unslop) Damir Sokolovsky (`CC BY 4.0`) без установки или запуска стороннего кода. Behance-референсы использованы только как визуальные ориентиры, без копирования.
