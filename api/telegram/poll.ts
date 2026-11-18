import { callbackMode, isPolling, pollOnce } from '../../server/core.js'
import { json } from '../_respond.js'

export async function POST() {
  if (callbackMode() !== 'polling') return json(409, { error: 'Polling is not active', mode: callbackMode() })
  if (isPolling()) return json(200, { ok: true, received: 0, loop: 'active' })
  try {
    const received = await pollOnce(0)
    return json(200, { ok: true, received })
  } catch {
    return json(502, { error: 'Telegram polling failed' })
  }
}
