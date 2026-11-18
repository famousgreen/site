import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { after, before, describe, test } from 'node:test'
import { POST as booking } from '../api/booking.js'
import { GET as health } from '../api/health.js'
import { POST as webhook } from '../api/telegram/webhook.js'

const MOCK_PORT = 4293
const CHAT_ID = '-1003887700261'
const calls: Array<{ method: string; payload: Record<string, unknown> }> = []
let mock: Server

const tomorrow = () => new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10)
const bookingRequest = (body: unknown) =>
  new Request('https://app.test/api/booking', { method: 'POST', body: JSON.stringify(body) })

before(async () => {
  mock = createServer((request, response) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => chunks.push(chunk))
    request.on('end', () => {
      calls.push({ method: (request.url ?? '').split('/').pop() ?? '', payload: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ ok: true, result: true }))
    })
  })
  await new Promise<void>((resolve) => mock.listen(MOCK_PORT, '127.0.0.1', resolve))
  process.env.TELEGRAM_API_BASE = `http://127.0.0.1:${MOCK_PORT}`
  process.env.TELEGRAM_BOT_TOKEN = 'test-token-not-real'
  process.env.TELEGRAM_WEBHOOK_SECRET = 'handler-secret'
  delete process.env.TELEGRAM_CHAT_ID
})

after(async () => {
  await new Promise((resolve) => mock.close(resolve))
})

describe('web-signature API handlers (published host)', () => {
  test('health reports configuration without exposing the token', async () => {
    const body = await (await health()).json()
    assert.deepEqual(body, { ok: true, telegramConfigured: true, callbacks: 'webhook' })
  })

  test('booking sends to the default chat with action buttons', async () => {
    calls.length = 0
    const response = await booking(bookingRequest({ name: 'SMOKE TEST', shootType: 'portrait', contactMethod: 'email', contact: 'a@b.co', date: tomorrow() }))
    assert.equal(response.status, 201)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].method, 'sendMessage')
    assert.equal(calls[0].payload.chat_id, CHAT_ID)
    const rows = (calls[0].payload.reply_markup as { inline_keyboard: unknown[][] }).inline_keyboard
    assert.equal(rows.flat().length, 3)
  })

  test('booking rejects invalid input and missing config', async () => {
    assert.equal((await booking(bookingRequest({ name: 'x' }))).status, 400)
    const token = process.env.TELEGRAM_BOT_TOKEN
    delete process.env.TELEGRAM_BOT_TOKEN
    assert.equal((await booking(bookingRequest({}))).status, 503)
    process.env.TELEGRAM_BOT_TOKEN = token
  })

  test('webhook requires the secret and handles callbacks', async () => {
    const update = { callback_query: { id: 'c1', data: 'status:answered:abcdef12', message: { message_id: 5, text: 'x', chat: { id: Number(CHAT_ID) } } } }
    const bad = await webhook(new Request('https://app.test/api/telegram/webhook', { method: 'POST', body: JSON.stringify(update) }))
    assert.equal(bad.status, 401)
    calls.length = 0
    const ok = await webhook(new Request('https://app.test/api/telegram/webhook', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': 'handler-secret' },
      body: JSON.stringify(update),
    }))
    assert.equal(ok.status, 200)
    assert.deepEqual(calls.map((call) => call.method), ['editMessageText', 'answerCallbackQuery'])
  })
})
