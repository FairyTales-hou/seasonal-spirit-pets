import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { dispatchPush, type ReminderPushPayload } from '../_shared/push.ts'

function jsonResponse(status: number, data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type,x-reminder-token,authorization,apikey',
    },
  })
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return jsonResponse(204, {})
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method_not_allowed' })
  }

  const expectedToken = Deno.env.get('REMINDER_PUSH_TOKEN')?.trim() ?? ''
  if (expectedToken) {
    const incoming = request.headers.get('x-reminder-token')?.trim() ?? ''
    if (!incoming || incoming !== expectedToken) {
      return jsonResponse(401, { ok: false, error: 'invalid_token' })
    }
  }

  let payload: ReminderPushPayload
  try {
    payload = (await request.json()) as ReminderPushPayload
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_json' })
  }

  try {
    const result = await dispatchPush({
      ...payload,
      messageType: payload.messageType ?? 'test',
    })
    return jsonResponse(200, {
      ok: true,
      ...result,
    })
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: 'push_failed',
      message: error instanceof Error ? error.message : 'unknown error',
    })
  }
})
