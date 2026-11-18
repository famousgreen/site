import { health } from '../server/core.js'
import { json } from './_respond.js'

export async function GET() {
  const result = health()
  return json(result.status, result.body)
}
