import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { after, before, describe, test } from 'node:test'

const APP_PORT = 4291
const MOCK_PORT = 4292
const CHAT_ID = '-1003887700261'
const WEBHOOK_SECRET = 'test-webhook-secret'
const BOT_TOKEN = 'test-token-not-real'
const app = `http://127.0.0.1:${APP_PORT}`

type Call = { method: string; payload: Record<string, unknown> }

const calls: Call[] = []
let mock: Server
let appProcess: ChildProcess

const tomorrow = () => new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10)

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${app}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

const callback = (data: string, chatId: number | string = Number(CHAT_ID)) => ({
  callback_query: {
    id: 'cb-1',
    data,
    message: { message_id: 77, text: 'Новая заявка на съёмку', chat: { id: chatId } },
  },
})

const webhook = (body: unknown, secret = WEBHOOK_SECRET) =>
  post('/api/telegram/webhook', body, { 'x-telegram-bot-api-secret-token': secret })

const waitForServer = async () => {
  for (let i = 0; i < 60; i += 1) {
    try {
      if ((await fetch(`${app}/api/health`)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('server did not start')
}

before(async () => {
  mock = createServer((request, response) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => chunks.push(chunk))
    request.on('end', () => {
      const method = (request.url ?? '').split('/').pop() ?? ''
      calls.push({ method, payload: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ ok: true, result: true }))
    })
  })
  await new Promise<void>((resolve) => mock.listen(MOCK_PORT, '127.0.0.1', resolve))

  appProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(APP_PORT),
      TELEGRAM_BOT_TOKEN: BOT_TOKEN,
      TELEGRAM_CHAT_ID: CHAT_ID,
      TELEGRAM_WEBHOOK_SECRET: WEBHOOK_SECRET,
      TELEGRAM_API_BASE: `http://127.0.0.1:${MOCK_PORT}`,
    },
    stdio: 'ignore',
  })
  await waitForServer()
})

after(async () => {
  appProcess?.kill()
  await new Promise((resolve) => mock?.close(resolve))
})

describe('booking endpoint', () => {
  test('rejects invalid bookings without calling Telegram', async () => {
    calls.length = 0
    const response = await post('/api/booking', { name: 'A', shootType: 'x', contactMethod: 'sms', contact: '1', date: '2000-01-01' })
    assert.equal(response.status, 400)
    assert.equal(calls.length, 0)
  })

  test('delivers a booking to the configured chat with action buttons', async () => {
    calls.length = 0
    const response = await post('/api/booking', {
      name: '<b>Anna</b>',
      shootType: 'wedding',
      contactMethod: 'telegram',
      contact: '@anna',
      date: tomorrow(),
    })
    assert.equal(response.status, 201)
    assert.equal(calls.length, 1)
    const [{ method, payload }] = calls
    assert.equal(method, 'sendMessage')
    assert.equal(payload.chat_id, CHAT_ID)
    assert.match(String(payload.text), /&lt;b&gt;Anna&lt;\/b&gt;/)
    const rows = (payload.reply_markup as { inline_keyboard: Array<Array<{ callback_data: string }>> }).inline_keyboard
    const data = rows.flat().map((button) => button.callback_data)
    assert.equal(data.length, 3)
    assert.ok(data.every((value) => /^(status|delete):(answered|question|ask):[a-f0-9]{8}$/.test(value)))
  })
})

describe('webhook callbacks', () => {
  test('rejects requests without the secret header', async () => {
    assert.equal((await webhook(callback('status:answered:abcdef12'), 'wrong')).status, 401)
    assert.equal((await post('/api/telegram/webhook', {})).status, 401)
  })

  test('marks a booking as answered or in question', async () => {
    for (const [action, label] of [['answered', 'Ответила'], ['question', 'Под вопросом']]) {
      calls.length = 0
      assert.equal((await webhook(callback(`status:${action}:abcdef12`))).status, 200)
      assert.deepEqual(calls.map((call) => call.method), ['editMessageText', 'answerCallbackQuery'])
      assert.match(String(calls[0].payload.text), new RegExp(`Статус: ${label}`))
    }
  })

  test('delete requires confirmation and can be cancelled', async () => {
    calls.length = 0
    await webhook(callback('delete:ask:abcdef12'))
    assert.deepEqual(calls.map((call) => call.method), ['editMessageReplyMarkup', 'answerCallbackQuery'])
    assert.ok(!calls.some((call) => call.method === 'deleteMessage'))

    calls.length = 0
    await webhook(callback('delete:cancel:abcdef12'))
    assert.deepEqual(calls.map((call) => call.method), ['editMessageReplyMarkup', 'answerCallbackQuery'])

    calls.length = 0
    await webhook(callback('delete:confirm:abcdef12'))
    assert.deepEqual(calls.map((call) => call.method), ['deleteMessage', 'answerCallbackQuery'])
    assert.equal(calls[0].payload.message_id, 77)
  })

  test('ignores callbacks from other chats and malformed data', async () => {
    calls.length = 0
    assert.equal((await webhook(callback('delete:confirm:abcdef12', 12345))).status, 200)
    assert.equal(calls.length, 0)

    await webhook(callback('delete:confirm:../../etc'))
    assert.deepEqual(calls.map((call) => call.method), ['answerCallbackQuery'])
    assert.ok(!calls.some((call) => call.method === 'deleteMessage'))
  })
})
