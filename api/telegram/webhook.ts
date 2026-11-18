import { processWebhook } from '../../server/core.js'
import { json } from '../_respond.js'

export async function POST(request: Request) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token') ?? ''
  const result = await processWebhook(secret, await request.text())
  return json(result.status, result.body)
}
