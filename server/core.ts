import process from 'node:process'
import { randomUUID, timingSafeEqual } from 'node:crypto'

export type Result = { status: number; body: object }

const MAX_BODY = 16_384
const allowedShootTypes = new Set(['portrait', 'wedding', 'commercial'])
const allowedMethods = new Set(['instagram', 'email', 'telegram', 'whatsapp'])

export const telegramChatId = () => process.env.TELEGRAM_CHAT_ID || '-1003887700261'

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

export const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

type BookingStatus = 'new' | 'answered' | 'question'

const statusView: Record<BookingStatus, { header: string; line: string }> = {
  new: { header: '📩 <b>Новая заявка на съёмку</b>', line: '🆕 Новая' },
  answered: { header: '✅ <b>Заявка · ответила</b>', line: '✅ Ответила' },
  question: { header: '❓ <b>Заявка · под вопросом</b>', line: '❓ Под вопросом' },
}

const attr = (value: string) => escapeHtml(value).replaceAll('"', '&quot;')

export const contactLink = (method: string, contact: string): string | null => {
  const value = contact.trim()
  if (method === 'email') {
    return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value) ? `mailto:${value}` : null
  }
  if (method === 'telegram') {
    const handle = value.replace(/^(https?:\/\/)?(t\.me\/|telegram\.me\/)/i, '').replace(/^@/, '')
    return /^[A-Za-z0-9_]{4,32}$/.test(handle) ? `https://t.me/${handle}` : null
  }
  if (method === 'instagram') {
    const handle = value.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/$/, '')
    return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://instagram.com/${handle}` : null
  }
  if (method === 'whatsapp') {
    const digits = value.replace(/[\s()+.-]/g, '')
    return /^\d{7,15}$/.test(digits) ? `https://wa.me/${digits}` : null
  }
  return null
}

const renderBooking = (booking: Booking, bookingId: string, status: BookingStatus) => {
  const link = contactLink(booking.contactMethod, booking.contact)
  const contact = link
    ? `<a href="${attr(link)}">${escapeHtml(booking.contact)}</a>`
    : escapeHtml(booking.contact)

  return [
    statusView[status].header,
    '',
    `<b>Имя:</b> ${escapeHtml(booking.name)}`,
    `<b>Формат:</b> ${shootLabels[booking.shootType]}`,
    `<b>Дата:</b> ${booking.date}`,
    `<b>Ответить через:</b> ${methodLabels[booking.contactMethod]}`,
    `<b>Контакт:</b> ${contact}`,
    '',
    `<b>Статус:</b> ${statusView[status].line}`,
    `<code>${bookingId}</code>`,
  ].join('\n')
}

const parseBookingText = (text: string): Booking | null => {
  const field = (label: string) => new RegExp(`^${label}: (.+)$`, 'm').exec(text)?.[1]?.trim()
  const shootLabel = field('Формат')
  const methodLabel = field('Ответить через')
  const shootType = Object.keys(shootLabels).find((key) => shootLabels[key] === shootLabel)
  const contactMethod = Object.keys(methodLabels).find((key) => methodLabels[key] === methodLabel)
  const name = field('Имя')
  const contact = field('Контакт')
  const date = field('Дата')
  if (!shootType || !contactMethod || !name || !contact || !date) return null
  return { name, shootType, contactMethod, contact, date }
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

type TelegramResponse = { ok: boolean; result?: unknown }

const telegram = async (method: string, payload: object, timeoutMs = 8_000, abort?: AbortSignal) => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Telegram is not configured')

  const response = await fetch(`${process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: abort ? AbortSignal.any([AbortSignal.timeout(timeoutMs), abort]) : AbortSignal.timeout(timeoutMs),
  })

  if (!response.ok) throw new Error(`Telegram API returned ${response.status}`)
  return response.json() as Promise<TelegramResponse>
}

const validateBooking = (input: Partial<Booking>): Booking | null => {
  const booking: Booking = {
    name: String(input.name ?? '').replace(/\s+/g, ' ').trim(),
    shootType: String(input.shootType ?? ''),
    contactMethod: String(input.contactMethod ?? ''),
    contact: String(input.contact ?? '').replace(/\s+/g, ' ').trim(),
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

  if (!callbackId || !data || !messageId || chatId !== telegramChatId()) return

  const match = /^(status|delete):(answered|question|ask|confirm|cancel):([a-f0-9]{8})$/.exec(data)
  if (!match) {
    await answerCallback(callbackId, 'Неизвестное действие')
    return
  }

  const [, group, action, bookingId] = match

  if (group === 'status' && (action === 'answered' || action === 'question')) {
    const statusKey: BookingStatus = action === 'answered' ? 'answered' : 'question'
    const status = statusView[statusKey].line
    const booking = parseBookingText(callback.message?.text ?? '')
    const fallbackText = (callback.message?.text ?? '').replace(/\n\nСтатус:.*$/s, '')
    await telegram('editMessageText', {
      chat_id: telegramChatId(),
      message_id: messageId,
      ...(booking
        ? {
            text: renderBooking(booking, bookingId, statusKey),
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }
        : { text: `${fallbackText}\n\nСтатус: ${status}` }),
      reply_markup: keyboard(bookingId),
    })
    await answerCallback(callbackId, `Статус: ${status.replace(/^\S+ /, '')}`)
    return
  }

  if (group === 'delete' && action === 'ask') {
    await telegram('editMessageReplyMarkup', {
      chat_id: telegramChatId(),
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
      chat_id: telegramChatId(),
      message_id: messageId,
      reply_markup: keyboard(bookingId),
    })
    await answerCallback(callbackId, 'Удаление отменено')
    return
  }

  if (group === 'delete' && action === 'confirm') {
    await telegram('deleteMessage', {
      chat_id: telegramChatId(),
      message_id: messageId,
    })
    await answerCallback(callbackId)
  }
}


type PollUpdate = { update_id: number; callback_query?: TelegramCallback }

export const callbackMode = (): 'webhook' | 'polling' | 'off' => {
  if (!process.env.TELEGRAM_BOT_TOKEN) return 'off'
  if (process.env.TELEGRAM_WEBHOOK_SECRET) return 'webhook'
  return process.env.TELEGRAM_POLLING === 'off' ? 'off' : 'polling'
}

let pollOffset = 0
const seenUpdates = new Set<number>()
let pollLoop: Promise<void> | null = null
let pollController: AbortController | null = null

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
  })

const clearWebhook = async () => {
  const info = (await telegram('getWebhookInfo', {})).result as { url?: string } | undefined
  if (info?.url) await telegram('deleteWebhook', { drop_pending_updates: false })
}

export const pollOnce = async (timeoutSeconds = 25, abort?: AbortSignal): Promise<number> => {
  const response = await telegram(
    'getUpdates',
    { offset: pollOffset, timeout: timeoutSeconds, allowed_updates: ['callback_query'] },
    (timeoutSeconds + 10) * 1000,
    abort,
  )
  const updates = Array.isArray(response.result) ? (response.result as PollUpdate[]) : []

  for (const update of updates) {
    pollOffset = Math.max(pollOffset, update.update_id + 1)
    if (seenUpdates.has(update.update_id)) continue
    seenUpdates.add(update.update_id)
    if (seenUpdates.size > 500) seenUpdates.delete(seenUpdates.values().next().value as number)
    if (!update.callback_query) continue
    try {
      await handleCallback(update.callback_query)
    } catch (error) {
      console.error('Callback processing failed', error instanceof Error ? error.message : 'unknown error')
    }
  }

  return updates.length
}

const runPolling = async (signal: AbortSignal) => {
  const timeout = Number(process.env.TELEGRAM_POLL_TIMEOUT ?? 25)
  let backoff = 1_000
  let webhookChecked = false

  while (!signal.aborted && callbackMode() === 'polling') {
    try {
      if (!webhookChecked) {
        await clearWebhook()
        webhookChecked = true
      }
      const received = await pollOnce(timeout, signal)
      backoff = 1_000
      if (received === 0 && timeout === 0) await sleep(200, signal)
    } catch (error) {
      if (signal.aborted) break
      const message = error instanceof Error ? error.message : 'unknown error'
      console.error('Telegram polling error', message)
      if (message.includes('409')) webhookChecked = false
      await sleep(backoff, signal)
      backoff = Math.min(backoff * 2, 30_000)
    }
  }
}

export const ensurePolling = (): boolean => {
  if (pollLoop || callbackMode() !== 'polling') return false
  const controller = new AbortController()
  pollController = controller
  pollLoop = runPolling(controller.signal).finally(() => {
    pollLoop = null
    pollController = null
  })
  return true
}

export const isPolling = () => pollLoop !== null

export const stopPolling = async () => {
  pollController?.abort()
  await pollLoop
}

export const resetPollingState = () => {
  pollOffset = 0
  seenUpdates.clear()
}

export const health = (): Result => {
  ensurePolling()
  return {
    status: 200,
    body: {
      ok: true,
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      callbacks: callbackMode(),
    },
  }
}

const parseJson = <T>(raw: string): T => {
  if (Buffer.byteLength(raw) > MAX_BODY) throw new Error('Payload too large')
  return JSON.parse(raw) as T
}

export const createBooking = async (raw: string): Promise<Result> => {
  ensurePolling()
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { status: 503, body: { error: 'Booking service is not configured' } }
  }

  let booking: Booking | null
  try {
    booking = validateBooking(parseJson<Partial<Booking>>(raw))
  } catch {
    return { status: 400, body: { error: 'Invalid booking data' } }
  }
  if (!booking) return { status: 400, body: { error: 'Invalid booking data' } }

  try {
    const bookingId = randomUUID().slice(0, 8)
    const text = renderBooking(booking, bookingId, 'new')

    await telegram('sendMessage', {
      chat_id: telegramChatId(),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: keyboard(bookingId),
    })

    return { status: 201, body: { ok: true, bookingId } }
  } catch (error) {
    console.error('Booking delivery failed', error instanceof Error ? error.message : 'unknown error')
    return { status: 502, body: { error: 'Could not deliver booking' } }
  }
}

export const processWebhook = async (providedSecret: string, raw: string): Promise<Result> => {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expectedSecret || !providedSecret || !safeEqual(providedSecret, expectedSecret)) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  try {
    const update = parseJson<TelegramUpdate>(raw)
    if (update.callback_query) await handleCallback(update.callback_query)
    return { status: 200, body: { ok: true } }
  } catch (error) {
    console.error('Webhook processing failed', error instanceof Error ? error.message : 'unknown error')
    return { status: 400, body: { error: 'Invalid update' } }
  }
}
