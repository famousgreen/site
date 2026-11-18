import { ensureWebhook, webhookReport } from '../../server/core.js'
import { json } from '../_respond.js'

export async function POST() {
  await ensureWebhook({ force: true, budgetMs: 8_000 })
  const webhook = webhookReport()
  return json(webhook.configured ? 200 : 502, { ok: webhook.configured, webhook })
}
