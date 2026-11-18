import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import { POST as booking } from '../api/booking.js'
import { GET as healthRoute } from '../api/health.js'
import { POST as setupRoute } from '../api/telegram/setup.js'
import { POST as webhook } from '../api/telegram/webhook.js'
import { createBooking, ensurePolling, ensureWebhook, health, isPolling, resetPollingState, resetWebhookState, stopPolling } from '../server/core.js'

const MOCK_PORT = 4295
const CHAT_ID = '-1003887700261'
const URL_EXPECTED = 'https://paris-photographer.apps.grok.bot/api/telegram/webhook'
const TOKEN = 'test-token-not-real'
const SECRET = 'rotating-secret-value'

type Call = { method: string; payload: Record<string, unknown> }
const calls: Call[] = []
let mock: Server
let setWebhookFailures = 0
let setWebhookError = 'Bad Request: bad webhook'
let registered: { url: string; allowed_updates: string[] } | null = null

const methods = () => calls.map((call) => call.method)
const count = (method: string) => calls.filter((call) => call.method === method).length
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const tomorrow = () => new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10)

before(async () => {
  mock = createServer((request, response) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => chunks.push(chunk))
    request.on('end', () => {
      const method = (request.url ?? '').split('/').pop() ?? ''
      const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
      calls.push({ method, payload })
      if (method === 'setWebhook' && setWebhookFailures > 0) {
        setWebhookFailures -= 1
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ ok: false, description: `${setWebhookError} ${SECRET} ${TOKEN}` }))
        return
      }
      let result: unknown = true
      if (method === 'setWebhook') registered = { url: payload.url, allowed_updates: payload.allowed_updates }
      if (method === 'getWebhookInfo') {
        result = registered ? { ...registered, pending_update_count: 2 } : { url: '' }
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ ok: true, result }))
    })
  })
  await new Promise<void>((resolve) => mock.listen(MOCK_PORT, '127.0.0.1', resolve))
})

after(async () => {
  await new Promise((resolve) => mock.close(resolve))
})

beforeEach(() => {
  calls.length = 0
  setWebhookFailures = 0
  registered = null
  resetWebhookState()
  resetPollingState()
  process.env.TELEGRAM_API_BASE = `http://127.0.0.1:${MOCK_PORT}`
  process.env.TELEGRAM_BOT_TOKEN = TOKEN
  process.env.TELEGRAM_CHAT_ID = CHAT_ID
  process.env.TELEGRAM_WEBHOOK_SECRET = SECRET
  process.env.TELEGRAM_AUTO_WEBHOOK = 'on'
  process.env.TELEGRAM_WEBHOOK_BACKOFF_MS = '60'
  process.env.TELEGRAM_WEBHOOK_RECHECK_MS = '600000'
  delete process.env.TELEGRAM_WEBHOOK_URL
  delete process.env.APP_PUBLIC_URL
})

afterEach(async () => {
  await stopPolling()
})

describe('automatic webhook setup', () => {
  test('registers the exact public URL with the secret and callback_query only', async () => {
    await ensureWebhook()
    const set = calls.filter((call) => call.method === 'setWebhook')
    assert.equal(set.length, 1)
    assert.equal(set[0].payload.url, URL_EXPECTED)
    assert.equal(set[0].payload.secret_token, SECRET)
    assert.deepEqual(set[0].payload.allowed_updates, ['callback_query'])
  })

  test('is idempotent and cached: no repeat setWebhook while healthy', async () => {
    await ensureWebhook()
    await ensureWebhook()
    await ensureWebhook()
    assert.equal(count('setWebhook'), 1)
    assert.equal(count('getWebhookInfo'), 0)
  })

  test('re-verifies after the cache expires and only re-sets when Telegram drifted', async () => {
    process.env.TELEGRAM_WEBHOOK_RECHECK_MS = '10'
    await ensureWebhook()
    await sleep(25)
    await ensureWebhook()
    assert.equal(count('getWebhookInfo'), 1)
    assert.equal(count('setWebhook'), 1)

    registered = { url: 'https://elsewhere.example/hook', allowed_updates: ['message'] }
    await sleep(25)
    await ensureWebhook()
    assert.equal(count('setWebhook'), 2)
    assert.equal(registered.url, URL_EXPECTED)
  })

  test('registers again when the secret is rotated', async () => {
    await ensureWebhook()
    process.env.TELEGRAM_WEBHOOK_SECRET = 'new-secret'
    await ensureWebhook()
    assert.equal(count('setWebhook'), 2)
    assert.equal(calls.filter((call) => call.method === 'setWebhook')[1].payload.secret_token, 'new-secret')
  })

  test('retries with backoff after failures and then succeeds', async () => {
    setWebhookFailures = 2
    await ensureWebhook()
    assert.equal(count('setWebhook'), 1)
    assert.equal((await health()).body && (await health()).status, 200)
    assert.equal(count('setWebhook'), 1, 'inside the backoff window no new attempt is made')

    await sleep(80)
    await ensureWebhook()
    assert.equal(count('setWebhook'), 2)

    await sleep(160)
    await ensureWebhook()
    assert.equal(count('setWebhook'), 3)
    const body = (await health()).body as { webhook: { configured: boolean; attempts: number } }
    assert.equal(body.webhook.configured, true)
    assert.equal(body.webhook.attempts, 0)
  })

  test('single flight: concurrent triggers produce one setWebhook', async () => {
    await Promise.all([ensureWebhook(), ensureWebhook(), health(), ensureWebhook()])
    assert.equal(count('setWebhook'), 1)
  })

  test('triggered by health, booking and the setup route', async () => {
    await healthRoute()
    assert.equal(count('setWebhook'), 1)

    resetWebhookState()
    calls.length = 0
    const response = await booking(new Request('https://x.test/api/booking', {
      method: 'POST',
      body: JSON.stringify({ name: 'SMOKE TEST', shootType: 'portrait', contactMethod: 'email', contact: 'a@b.co', date: tomorrow() }),
    }))
    assert.equal(response.status, 201)
    assert.deepEqual(methods().filter((method) => method !== 'sendMessage'), ['setWebhook'])

    calls.length = 0
    const setup = await setupRoute()
    assert.equal(setup.status, 200)
    assert.equal(count('setWebhook'), 1)
  })

  test('booking still succeeds when webhook setup fails', async () => {
    setWebhookFailures = 5
    const result = await createBooking(JSON.stringify({ name: 'SMOKE TEST', shootType: 'portrait', contactMethod: 'email', contact: 'a@b.co', date: tomorrow() }))
    assert.equal(result.status, 201)
  })

  test('does nothing unless auto setup is allowed (local runs never touch the live webhook)', async () => {
    process.env.TELEGRAM_AUTO_WEBHOOK = 'off'
    await ensureWebhook()
    delete process.env.TELEGRAM_AUTO_WEBHOOK
    delete process.env.CURSOR_APP_ID
    delete process.env.VERCEL
    await ensureWebhook()
    assert.equal(calls.length, 0)
    process.env.CURSOR_APP_ID = 'app_test'
    await ensureWebhook()
    assert.equal(count('setWebhook'), 1)
    delete process.env.CURSOR_APP_ID
  })

  test('custom public URL is honoured', async () => {
    process.env.APP_PUBLIC_URL = 'https://custom.example/'
    await ensureWebhook()
    assert.equal(calls[0].payload.url, 'https://custom.example/api/telegram/webhook')
  })
})

describe('health reporting', () => {
  test('reports mode and webhook state without secrets', async () => {
    const body = (await health()).body as Record<string, any>
    assert.equal(body.callbacks, 'webhook')
    assert.equal(body.webhook.url, URL_EXPECTED)
    assert.equal(body.webhook.secretSet, true)
    assert.equal(body.webhook.configured, true)
    assert.equal(body.webhook.status, 'configured')
    assert.deepEqual(body.webhook.allowedUpdates, ['callback_query'])
    assert.equal(body.polling.reliable, false)
    const serialised = JSON.stringify(body)
    assert.ok(!serialised.includes(SECRET))
    assert.ok(!serialised.includes(TOKEN))
  })

  test('errors are surfaced but redacted', async () => {
    setWebhookFailures = 1
    const body = (await health()).body as Record<string, any>
    assert.equal(body.webhook.status, 'error')
    assert.match(body.webhook.lastError, /Bad Request/)
    assert.ok(body.webhook.nextRetryAt)
    const serialised = JSON.stringify(body)
    assert.ok(!serialised.includes(SECRET))
    assert.ok(!serialised.includes(TOKEN))
  })

  test('reports polling as fallback mode when no webhook secret exists', async () => {
    delete process.env.TELEGRAM_WEBHOOK_SECRET
    process.env.TELEGRAM_POLL_TIMEOUT = '0'
    const body = (await health()).body as Record<string, any>
    assert.equal(body.callbacks, 'polling')
    assert.equal(body.webhook.secretSet, false)
    assert.equal(count('setWebhook'), 0)
    assert.equal(isPolling(), false, 'health must not start polling on serverless')
    assert.equal(ensurePolling(), true)
  })
})

describe('callbacks through the configured webhook', () => {
  test('authorised callbacks are processed and unauthorised ones rejected', async () => {
    await ensureWebhook()
    calls.length = 0
    const update = { callback_query: { id: 'c1', data: 'delete:confirm:abcdef12', message: { message_id: 9, text: 'x', chat: { id: Number(CHAT_ID) } } } }
    const denied = await webhook(new Request('https://x.test/api/telegram/webhook', { method: 'POST', body: JSON.stringify(update) }))
    assert.equal(denied.status, 401)
    assert.equal(calls.length, 0)

    const allowed = await webhook(new Request('https://x.test/api/telegram/webhook', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': SECRET },
      body: JSON.stringify(update),
    }))
    assert.equal(allowed.status, 200)
    assert.deepEqual(methods(), ['deleteMessage', 'answerCallbackQuery'])
  })
})
