import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import { callbackMode, ensurePolling, health, isPolling, pollOnce, resetPollingState, stopPolling } from '../server/core.js'
import { POST as pollRoute } from '../api/telegram/poll.js'

const MOCK_PORT = 4294
const CHAT_ID = '-1003887700261'

type Call = { method: string; payload: Record<string, unknown> }
const calls: Call[] = []
const updateQueue: Array<Record<string, unknown>[]> = []
let webhookUrl = ''
const failing = new Set<string>()
let mock: Server

const cb = (updateId: number, data: string, chat: number | string = Number(CHAT_ID)) => ({
  update_id: updateId,
  callback_query: { id: `cb-${updateId}`, data, message: { message_id: 40 + updateId, text: 'Новая заявка', chat: { id: chat } } },
})

const methods = () => calls.map((call) => call.method)
const waitFor = async (condition: () => boolean, ms = 3000) => {
  const end = Date.now() + ms
  while (!condition() && Date.now() < end) await new Promise((resolve) => setTimeout(resolve, 20))
  assert.ok(condition(), 'condition not met in time')
}

before(async () => {
  mock = createServer((request, response) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => chunks.push(chunk))
    request.on('end', () => {
      const method = (request.url ?? '').split('/').pop() ?? ''
      calls.push({ method, payload: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') })
      if (failing.has(method)) {
        response.writeHead(500)
        response.end('{}')
        return
      }
      let result: unknown = true
      if (method === 'getUpdates') result = updateQueue.shift() ?? []
      if (method === 'getWebhookInfo') result = { url: webhookUrl }
      if (method === 'deleteWebhook') webhookUrl = ''
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
  updateQueue.length = 0
  webhookUrl = ''
  failing.clear()
  resetPollingState()
  process.env.TELEGRAM_API_BASE = `http://127.0.0.1:${MOCK_PORT}`
  process.env.TELEGRAM_BOT_TOKEN = 'test-token-not-real'
  process.env.TELEGRAM_CHAT_ID = CHAT_ID
  process.env.TELEGRAM_POLL_TIMEOUT = '0'
  delete process.env.TELEGRAM_WEBHOOK_SECRET
  delete process.env.TELEGRAM_POLLING
})

afterEach(async () => {
  await stopPolling()
})

describe('callback mode', () => {
  test('uses polling only with a token and without a webhook secret', () => {
    assert.equal(callbackMode(), 'polling')
    process.env.TELEGRAM_WEBHOOK_SECRET = 'secret'
    assert.equal(callbackMode(), 'webhook')
    delete process.env.TELEGRAM_WEBHOOK_SECRET
    process.env.TELEGRAM_POLLING = 'off'
    assert.equal(callbackMode(), 'off')
    delete process.env.TELEGRAM_POLLING
    delete process.env.TELEGRAM_BOT_TOKEN
    assert.equal(callbackMode(), 'off')
  })

  test('does not start polling in webhook mode', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'secret'
    assert.equal(ensurePolling(), false)
    assert.equal(isPolling(), false)
    assert.equal(calls.length, 0)
  })

  test('health reports the callback mode', async () => {
    const body = (await health()).body as { callbacks: string }
    assert.equal(body.callbacks, 'polling')
  })
})

describe('pollOnce', () => {
  test('handles status and delete callbacks and advances the offset', async () => {
    updateQueue.push([cb(10, 'status:answered:abcdef12'), cb(11, 'status:question:abcdef12'), cb(12, 'delete:ask:abcdef12'), cb(13, 'delete:confirm:abcdef12')])
    assert.equal(await pollOnce(0), 4)
    assert.deepEqual(methods(), [
      'getUpdates',
      'editMessageText', 'answerCallbackQuery',
      'editMessageText', 'answerCallbackQuery',
      'editMessageReplyMarkup', 'answerCallbackQuery',
      'deleteMessage', 'answerCallbackQuery',
    ])
    assert.equal(calls[0].payload.offset, 0)
    assert.deepEqual(calls[0].payload.allowed_updates, ['callback_query'])

    calls.length = 0
    await pollOnce(0)
    assert.equal(calls[0].payload.offset, 14)
  })

  test('processes a redelivered update only once', async () => {
    updateQueue.push([cb(20, 'status:answered:abcdef12')], [cb(20, 'status:answered:abcdef12')])
    await pollOnce(0)
    await pollOnce(0)
    assert.equal(methods().filter((method) => method === 'editMessageText').length, 1)
  })

  test('ignores other chats and unknown actions safely', async () => {
    updateQueue.push([cb(30, 'delete:confirm:abcdef12', 999), cb(31, 'delete:confirm:../x'), { update_id: 32, message: { text: 'hi' } }])
    await pollOnce(0)
    assert.ok(!methods().includes('deleteMessage'))
    assert.equal(calls[calls.length - 1].method, 'answerCallbackQuery')
    calls.length = 0
    await pollOnce(0)
    assert.equal(calls[0].payload.offset, 33)
  })

  test('a failing callback does not block later updates or the offset', async () => {
    failing.add('editMessageText')
    updateQueue.push([cb(40, 'status:answered:abcdef12'), cb(41, 'delete:ask:abcdef12')])
    await pollOnce(0)
    assert.ok(methods().includes('editMessageReplyMarkup'))
    calls.length = 0
    await pollOnce(0)
    assert.equal(calls[0].payload.offset, 42)
  })
})

describe('polling loop', () => {
  test('removes an existing webhook, polls, and handles buttons', async () => {
    webhookUrl = 'https://old.example/api/telegram/webhook'
    updateQueue.push([cb(50, 'status:answered:abcdef12')])
    assert.equal(ensurePolling(), true)
    assert.equal(ensurePolling(), false)
    await waitFor(() => methods().includes('answerCallbackQuery'))
    assert.ok(methods().includes('deleteWebhook'))
    assert.ok(methods().indexOf('deleteWebhook') < methods().indexOf('getUpdates'))
    await stopPolling()
    assert.equal(isPolling(), false)
    assert.equal(methods().filter((method) => method === 'editMessageText').length, 1)
  })

  test('the poll route reports inactive polling in webhook mode', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'secret'
    assert.equal((await pollRoute()).status, 409)
  })

  test('the poll route drains updates once when no loop is running', async () => {
    updateQueue.push([cb(60, 'status:question:abcdef12')])
    const response = await pollRoute()
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true, received: 1 })
  })
})
