import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { dispatchPush } from '../_shared/push.ts'
import { getSolarTermNameByDate } from '../_shared/solar-term.ts'

interface HomeProfileRow {
  user_id: string
  city_name: string
  reminder_time: string
  daily_reminder_enabled: boolean
  solar_term_reminder_enabled: boolean
}

type ReminderKind = 'daily' | 'solar-term'

function jsonResponse(status: number, data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type,x-scheduler-token,authorization,apikey',
    },
  })
}

function getChinaNow() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>

  const dateKey = `${byType.year}-${byType.month}-${byType.day}`
  const timeHHMM = `${byType.hour}:${byType.minute}`
  return { dateKey, timeHHMM }
}

function normalizeTime(text: string) {
  const raw = text.trim()
  const matched = /^(\d{1,2}):(\d{1,2})$/.exec(raw)
  if (!matched) {
    return ''
  }
  const hour = Number(matched[1])
  const minute = Number(matched[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return ''
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

async function ensureDispatchLog(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  dateKey: string,
  timeHHMM: string,
  reminderKind: ReminderKind,
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/reminder_dispatch_logs`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: userId,
      dispatch_date: dateKey,
      dispatch_time: timeHHMM,
      reminder_kind: reminderKind,
      status: 'pending',
    }),
  })

  if (response.ok) {
    return true
  }

  const errorText = await response.text()
  if (response.status === 409 || errorText.includes('23505') || errorText.includes('duplicate key')) {
    return false
  }

  throw new Error(`insert_dispatch_log_failed:${response.status}:${errorText}`)
}

async function completeDispatchLog(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  dateKey: string,
  reminderKind: ReminderKind,
  status: 'sent' | 'failed',
  responseBody: string,
) {
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    dispatch_date: `eq.${dateKey}`,
    reminder_kind: `eq.${reminderKind}`,
  })

  const response = await fetch(`${supabaseUrl}/rest/v1/reminder_dispatch_logs?${query.toString()}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status,
      response_body: responseBody,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.warn('[scheduler] update dispatch log failed', response.status, text)
  }
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return jsonResponse(204, {})
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method_not_allowed' })
  }

  const expectedToken = Deno.env.get('SCHEDULER_TOKEN')?.trim() ?? ''
  if (expectedToken) {
    const incoming = request.headers.get('x-scheduler-token')?.trim() ?? ''
    if (!incoming || incoming !== expectedToken) {
      return jsonResponse(401, { ok: false, error: 'invalid_scheduler_token' })
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() ?? ''
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? ''
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(500, { ok: false, error: 'missing_supabase_service_role' })
  }

  const { dateKey, timeHHMM } = getChinaNow()
  const solarTermName = getSolarTermNameByDate(dateKey)

  const profileQuery = new URLSearchParams({
    select: 'user_id,city_name,reminder_time,daily_reminder_enabled,solar_term_reminder_enabled',
    reminder_enabled: 'eq.true',
    reminder_subscription_status: 'eq.granted',
  })
  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/home_profiles?${profileQuery.toString()}`, {
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  })
  if (!profileResponse.ok) {
    const text = await profileResponse.text()
    return jsonResponse(500, { ok: false, error: 'query_profiles_failed', message: text })
  }
  const rows = (await profileResponse.json()) as HomeProfileRow[]

  let dueCount = 0
  let sentCount = 0
  const skipped: string[] = []
  const failures: Array<{ userId: string; kind: ReminderKind; message: string }> = []

  for (const row of rows) {
    const normalizedReminderTime = normalizeTime(row.reminder_time || '')
    if (!normalizedReminderTime || normalizedReminderTime !== timeHHMM) {
      continue
    }

    const kinds: ReminderKind[] = []
    if (row.daily_reminder_enabled) {
      kinds.push('daily')
    }
    if (row.solar_term_reminder_enabled && solarTermName) {
      kinds.push('solar-term')
    }

    for (const kind of kinds) {
      dueCount += 1

      const shouldSend = await ensureDispatchLog(
        supabaseUrl,
        supabaseServiceRoleKey,
        row.user_id,
        dateKey,
        timeHHMM,
        kind,
      )
      if (!shouldSend) {
        skipped.push(`${row.user_id}:${kind}`)
        continue
      }

      try {
        const result = await dispatchPush({
          userId: row.user_id,
          cityName: row.city_name,
          reminderTime: normalizedReminderTime,
          dailyReminderEnabled: row.daily_reminder_enabled,
          solarTermReminderEnabled: row.solar_term_reminder_enabled,
          messageType: kind,
          solarTermName: solarTermName ?? undefined,
        })

        await completeDispatchLog(
          supabaseUrl,
          supabaseServiceRoleKey,
          row.user_id,
          dateKey,
          kind,
          'sent',
          JSON.stringify(result),
        )
        sentCount += 1
      } catch (pushError) {
        const message = pushError instanceof Error ? pushError.message : 'unknown error'
        await completeDispatchLog(
          supabaseUrl,
          supabaseServiceRoleKey,
          row.user_id,
          dateKey,
          kind,
          'failed',
          message,
        )
        failures.push({ userId: row.user_id, kind, message })
      }
    }
  }

  return jsonResponse(200, {
    ok: true,
    dateKey,
    timeHHMM,
    solarTermName,
    profileCount: rows.length,
    dueCount,
    sentCount,
    skippedDuplicates: skipped.length,
    skipped,
    failures,
  })
})
