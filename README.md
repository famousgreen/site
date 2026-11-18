# Hanna Chauvat — photographer portfolio

Mobile-first продающий прототип портфолио фотографа в Париже и Нормандии. Включает три формата съёмки, адаптивную редакционную подачу и форму бронирования с доставкой заявок в Telegram.

## Локальный запуск

Требуется Node.js 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

Сайт и API откроются на `http://localhost:4173`.

Для Telegram создайте новый токен через BotFather. Не используйте токен, который когда-либо отправлялся в чат или попадал в историю репозитория. Заполните `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (по умолчанию `-1003887700261`) и случайный `TELEGRAM_WEBHOOK_SECRET` в локальном `.env`.

## Telegram webhook

Заявки отправляются в chat ID `-1003887700261`. Callback-кнопки поддерживают статусы «Ответила», «Под вопросом» и двухшаговое удаление. Endpoint проверяет заголовок `X-Telegram-Bot-Api-Secret-Token`, chat ID и формат callback data.

После деплоя зарегистрируйте webhook с URL `https://your-domain.example/api/telegram/webhook` и передайте `TELEGRAM_WEBHOOK_SECRET` как `secret_token`. Секреты не коммитьте и не передавайте в URL публичных сервисов.

### Кнопки без публичного webhook (polling)

Если задан `TELEGRAM_BOT_TOKEN`, а `TELEGRAM_WEBHOOK_SECRET` пуст, сервер сам опрашивает Telegram через `getUpdates` (long polling 25 с, `allowed_updates=["callback_query"]`, offset подтверждается сразу, повторные `update_id` игнорируются). Если у бота был webhook, он снимается через `deleteWebhook`. Кнопки «Ответила», «Под вопросом» и удаление с подтверждением работают так же, как через webhook. `GET /api/health` показывает `callbacks: "polling" | "webhook" | "off"`. Отключить: `TELEGRAM_POLLING=off`.

Ограничение: polling живёт, пока работает процесс. В Node-сервере он запускается при старте; на serverless-хосте цикл стартует при первом обращении к `/api/health` или `/api/booking` и живёт, пока инстанс тёплый. Для надёжности можно дёргать `POST /api/telegram/poll` по расписанию (одноразовый опрос). Если задан `TELEGRAM_WEBHOOK_SECRET`, polling не запускается (приоритет у webhook).

## Проверки и production preview

```bash
npm run lint
npm run typecheck
npm run build
npm run test:ui          # Playwright; поднимает dev server на 4173, если он не запущен
npm run test:telegram    # mock-интеграция Telegram, без сети и секретов
npm run preview
```

Production preview также работает на `http://localhost:4173`.

## Структура сайта

Hero → About (портрет, био, география, факты, публикации) → Cases (4 проекта) → Shoots (accordion Portrait/Wedding/Commercial с горизонтальной лентой примеров) → контакт. Клик по кейсу открывает полноэкранный project viewer в том же окне: URL `#case/<id>` (deep link, кнопка «назад» закрывает), собственный вертикальный скролл, focus trap и возврат фокуса, Escape, prev/next. На десктопе фото собраны в перекрывающийся коллаж, на мобильном — в читаемую ленту. Тексты новых секций лежат в `src/content.ts` (FR/EN/УКР/РУС); имена публикаций, клиентов и кейсов — демонстрационный контент, замените реальными. Фото — AI-генерация для прототипа.

## Локализация

FR, EN, УКР, РУС. Язык выбирается синхронно до первого рендера: сначала значение `localStorage["hc-lang"]` (ручной выбор), затем первый поддерживаемый язык из `navigator.languages` (fr, uk, ru), иначе EN. Переключатель всегда виден в шапке. Тексты Telegram-сообщений для фотографа остаются русскими, пользовательские данные не переводятся.

## Live-проверка Telegram

Статус: **BLOCKED** — нового токена в окружении нет, старый токен не используется. Mock-тесты (`npm run test:telegram`) покрывают доставку заявки, секрет webhook, статусы, удаление с подтверждением, чужой чат и неверные callback data.

Когда появится новый токен:

```bash
# .env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_CHAT_ID
npm run dev
npm run telegram:smoke -- --webhook-info
```

Скрипт без токена завершается с кодом 2 и сообщением `BLOCKED`, секреты не печатает. Он отправляет заявку «SMOKE TEST» и просит вручную нажать кнопки в Telegram (webhook должен быть зарегистрирован с тем же `secret_token`).

## Основа и дизайн-процесс

Проект сохраняет React, Vite и TypeScript-основу шаблона [di-sukharev/vibe](https://github.com/di-sukharev/vibe). Для дизайн-аудита использованы принципы [Unslop](https://github.com/heydamir/unslop) Damir Sokolovsky (`CC BY 4.0`) без установки или запуска стороннего кода. Behance-референсы использованы только как визуальные ориентиры, без копирования.
