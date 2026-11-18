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

  const response = await fetch(`${process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/bot${token}/${method}`, {
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
    const baseText = (callback.message?.text ?? '').replace(/\n\nСтатус:.*$/s, '')
    const status = action === 'answered' ? 'Ответила' : 'Под вопросом'
    await telegram('editMessageText', {
      chat_id: telegramChatId(),
      message_id: messageId,
      text: `${baseText}\n\nСтатус: ${status}`,
      reply_markup: keyboard(bookingId),
    })
    await answerCallback(callbackId, `Статус: ${status}`)
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


export const health = (): Result => ({
  status: 200,
  body: { ok: true, telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN) },
})

const parseJson = <T>(raw: string): T => {
  if (Buffer.byteLength(raw) > MAX_BODY) throw new Error('Payload too large')
  return JSON.parse(raw) as T
}

export const createBooking = async (raw: string): Promise<Result> => {
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
