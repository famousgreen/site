import 'dotenv/config'
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const port = Number(process.env.PORT ?? 4173)
const telegramChatId = process.env.TELEGRAM_CHAT_ID || '-1003887700261'
const telegramApiBase = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'
const allowedShootTypes = new Set(['portrait', 'wedding', 'commercial'])
const allowedMethods = new Set(['instagram', 'email', 'telegram', 'whatsapp'])

type Booking = {
  name: string
  shootType: string
  contactMethod: string
  contact: string
  date: string
}

type TelegramCallback = {
  id?: string
  data?: string
  message?: {
    message_id?: number
    text?: string
    chat?: { id?: number | string }
  }
}

type TelegramUpdate = {
  callback_query?: TelegramCallback
}

const shootLabels: Record<string, string> = {
  portrait: 'Обычная съёмка',
  wedding: 'Свадебная съёмка',
  commercial: 'Коммерческая съёмка',
}

const methodLabels: Record<string, string> = {
  instagram: 'Instagram',
  email: 'Email',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
}

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const readJson = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 16_384) throw new Error('Payload too large')
    chunks.push(buffer)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T
}

const sendJson = (response: ServerResponse, status: number, body: object) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(body))
}

const keyboard = (bookingId: string) => ({
  inline_keyboard: [
    [
      { text: 'Ответила', callback_data: `status:answered:${bookingId}` },
      { text: 'Под вопросом', callback_data: `status:question:${bookingId}` },
    ],
    [{ text: 'Удалить', callback_data: `delete:ask:${bookingId}` }],
  ],
})

const telegram = async (method: string, payload: object) => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Telegram is not configured')

  const response = await fetch(`${telegramApiBase}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) throw new Error(`Telegram API returned ${response.status}`)
  return response.json() as Promise<{ ok: boolean }>
}

const validateBooking = (input: Partial<Booking>): Booking | null => {
  const booking: Booking = {
    name: String(input.name ?? '').trim(),
    shootType: String(input.shootType ?? ''),
    contactMethod: String(input.contactMethod ?? ''),
    contact: String(input.contact ?? '').trim(),
    date: String(input.date ?? ''),
  }

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(booking.date)
  const today = new Date().toISOString().slice(0, 10)
  const valid =
    booking.name.length >= 2 &&
    booking.name.length <= 80 &&
    allowedShootTypes.has(booking.shootType) &&
    allowedMethods.has(booking.contactMethod) &&
    booking.contact.length >= 3 &&
    booking.contact.length <= 160 &&
    validDate &&
    booking.date >= today

  return valid ? booking : null
}

const handleBooking = async (request: IncomingMessage, response: ServerResponse) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    sendJson(response, 503, { error: 'Booking service is not configured' })
    return
  }

  try {
    const booking = validateBooking(await readJson<Partial<Booking>>(request))
    if (!booking) {
      sendJson(response, 400, { error: 'Invalid booking data' })
      return
    }

    const bookingId = randomUUID().slice(0, 8)
    const text = [
      '<b>Новая заявка на съёмку</b>',
      '',
      `<b>Имя:</b> ${escapeHtml(booking.name)}`,
      `<b>Формат:</b> ${shootLabels[booking.shootType]}`,
      `<b>Дата:</b> ${booking.date}`,
      `<b>Ответить через:</b> ${methodLabels[booking.contactMethod]}`,
      `<b>Контакт:</b> ${escapeHtml(booking.contact)}`,
      '',
      `<code>${bookingId}</code>`,
    ].join('\n')

    await telegram('sendMessage', {
      chat_id: telegramChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: keyboard(bookingId),
    })

    sendJson(response, 201, { ok: true, bookingId })
  } catch (error) {
    console.error('Booking delivery failed', error)
    sendJson(response, 502, { error: 'Could not deliver booking' })
  }
}

const answerCallback = async (callbackId: string, text?: string) => {
  await telegram('answerCallbackQuery', {
    callback_query_id: callbackId,
    ...(text ? { text } : {}),
  })
}

const handleCallback = async (callback: TelegramCallback) => {
  const callbackId = callback.id
  const data = callback.data
  const messageId = callback.message?.message_id
  const chatId = String(callback.message?.chat?.id ?? '')

  if (!callbackId || !data || !messageId || chatId !== telegramChatId) return

  const match = /^(status|delete):(answered|question|ask|confirm|cancel):([a-f0-9]{8})$/.exec(data)
  if (!match) {
    await answerCallback(callbackId, 'Неизвестное действие')
    return
  }

  const [, group, action, bookingId] = match

  if (group === 'status' && (action === 'answered' || action === 'question')) {
    const baseText = (callback.message?.text ?? '').replace(/\n\nСтатус:.*$/s, '')
    const status = action === 'answered' ? 'Ответила' : 'Под вопросом'
    await telegram('editMessageText', {
      chat_id: telegramChatId,
      message_id: messageId,
      text: `${baseText}\n\nСтатус: ${status}`,
      reply_markup: keyboard(bookingId),
    })
    await answerCallback(callbackId, `Статус: ${status}`)
    return
  }

  if (group === 'delete' && action === 'ask') {
    await telegram('editMessageReplyMarkup', {
      chat_id: telegramChatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [[
          { text: 'Да, удалить', callback_data: `delete:confirm:${bookingId}` },
          { text: 'Отмена', callback_data: `delete:cancel:${bookingId}` },
        ]],
      },
    })
    await answerCallback(callbackId, 'Подтвердите удаление')
    return
  }

  if (group === 'delete' && action === 'cancel') {
    await telegram('editMessageReplyMarkup', {
      chat_id: telegramChatId,
      message_id: messageId,
      reply_markup: keyboard(bookingId),
    })
    await answerCallback(callbackId, 'Удаление отменено')
    return
  }

  if (group === 'delete' && action === 'confirm') {
    await telegram('deleteMessage', {
      chat_id: telegramChatId,
      message_id: messageId,
    })
    await answerCallback(callbackId)
  }
}

const handleWebhook = async (request: IncomingMessage, response: ServerResponse) => {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  const providedSecret = String(request.headers['x-telegram-bot-api-secret-token'] ?? '')

  if (!expectedSecret || !providedSecret || !safeEqual(providedSecret, expectedSecret)) {
    sendJson(response, 401, { error: 'Unauthorized' })
    return
  }

  try {
    const update = await readJson<TelegramUpdate>(request)
    if (update.callback_query) await handleCallback(update.callback_query)
    sendJson(response, 200, { ok: true })
  } catch (error) {
    console.error('Webhook processing failed', error)
    sendJson(response, 400, { error: 'Invalid update' })
  }
}

const serveStatic = async (request: IncomingMessage, response: ServerResponse) => {
  const requestPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
  const candidate = path.resolve(dist, `.${requestPath}`)
  const safeCandidate = candidate.startsWith(`${dist}${path.sep}`) ? candidate : path.join(dist, 'index.html')

  let filePath = safeCandidate
  try {
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) filePath = path.join(filePath, 'index.html')
  } catch {
    filePath = path.join(dist, 'index.html')
  }

  const extension = path.extname(filePath)
  const contentTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
  }

  response.writeHead(200, { 'Content-Type': contentTypes[extension] ?? 'application/octet-stream' })
  createReadStream(filePath).pipe(response)
}

const start = async () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const vite = isProduction
    ? null
    : await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' })

  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname

    if (request.method === 'POST' && pathname === '/api/booking') {
      await handleBooking(request, response)
      return
    }

    if (request.method === 'POST' && pathname === '/api/telegram/webhook') {
      await handleWebhook(request, response)
      return
    }

    if (request.method === 'GET' && pathname === '/api/health') {
      sendJson(response, 200, { ok: true, telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN) })
      return
    }

    if (vite) {
      vite.middlewares(request, response, () => sendJson(response, 404, { error: 'Not found' }))
      return
    }

    await serveStatic(request, response)
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`Portfolio server listening on http://localhost:${port}`)
  })
}

await start()
