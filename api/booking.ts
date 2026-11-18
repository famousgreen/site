import { createBooking } from '../server/core.js'
import { json } from './_respond.js'

export async function POST(request: Request) {
  const result = await createBooking(await request.text())
  return json(result.status, result.body)
}
