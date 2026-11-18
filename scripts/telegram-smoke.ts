import 'dotenv/config'
import process from 'node:process'

/**
 * Live Telegram smoke test. Sends one clearly marked test booking through the
 * running app (default http://127.0.0.1:4173) and then waits for you to press
 * the buttons in Telegram. Secrets are read from the environment and never printed.
 *
 *   npm run dev            # in another terminal, with a real .env
 *   npm run telegram:smoke
 *   npm run telegram:smoke -- --webhook-info   # also report webhook status
 */
const token = process.env.TELEGRAM_BOT_TOKEN
const secret = process.env.TELEGRAM_WEBHOOK_SECRET
const chatId = process.env.TELEGRAM_CHAT_ID || '-1003887700261'
const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'

if (!token || !secret) {
  console.log('BLOCKED: TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET are not set.')
  console.log('Create a new bot token with BotFather, put both values in .env, then rerun.')
  process.exit(2)
}

const api = async (method: string) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    signal: AbortSignal.timeout(8_000),
  })
  return (await response.json()) as { ok: boolean; result?: Record<string, unknown>; description?: string }
}

const me = await api('getMe')
if (!me.ok) {
  console.log(`FAILED: Telegram rejected the bot token (${me.description ?? 'unknown error'}).`)
  process.exit(1)
}
console.log(`Bot OK: @${String(me.result?.username)}, target chat ${chatId}`)

if (process.argv.includes('--webhook-info')) {
  const info = await api('getWebhookInfo')
  const result = info.result ?? {}
  console.log(`Webhook url set: ${result.url ? 'yes' : 'no'}, pending updates: ${String(result.pending_update_count ?? 0)}`)
  if (result.last_error_message) console.log(`Last webhook error: ${String(result.last_error_message)}`)
}

const date = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10)
const response = await fetch(`${baseUrl}/api/booking`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'SMOKE TEST — ignore',
    shootType: 'portrait',
    contactMethod: 'email',
    contact: 'smoke-test@example.com',
    date,
  }),
})

if (!response.ok) {
  console.log(`FAILED: ${baseUrl}/api/booking answered ${response.status}`)
  process.exit(1)
}

const { bookingId } = (await response.json()) as { bookingId: string }
console.log(`Sent test booking ${bookingId}. In Telegram, verify manually:`)
console.log('  1. «Ответила» and «Под вопросом» update the message status line')
console.log('  2. «Удалить» shows «Да, удалить» / «Отмена»; «Отмена» restores the buttons')
console.log('  3. «Да, удалить» deletes the message')
console.log('Callbacks only work once the webhook points at /api/telegram/webhook with TELEGRAM_WEBHOOK_SECRET.')
