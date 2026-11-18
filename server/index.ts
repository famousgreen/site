import 'dotenv/config'
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createBooking, ensurePolling, health, processWebhook } from './core.js'
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

const readBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 16_384) return '{'.repeat(16_385)
    chunks.push(buffer)
  }

  return Buffer.concat(chunks).toString('utf8')
}

const sendJson = (response: ServerResponse, status: number, body: object) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(body))
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
      const result = await createBooking(await readBody(request))
      sendJson(response, result.status, result.body)
      return
    }

    if (request.method === 'POST' && pathname === '/api/telegram/webhook') {
      const secret = String(request.headers['x-telegram-bot-api-secret-token'] ?? '')
      const result = await processWebhook(secret, await readBody(request))
      sendJson(response, result.status, result.body)
      return
    }

    if (request.method === 'GET' && pathname === '/api/health') {
      const result = health()
      sendJson(response, result.status, result.body)
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
    if (ensurePolling()) console.log('Telegram callback polling started')
  })
}

await start()
