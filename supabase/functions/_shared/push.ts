export type PushChannel = 'bark' | 'serverchan' | 'custom-webhook'

export interface ReminderPushPayload {
  userId?: string
  cityName?: string
  reminderTime?: string
  dailyReminderEnabled?: boolean
  solarTermReminderEnabled?: boolean
  messageType?: 'test' | 'daily' | 'solar-term'
  solarTermName?: string
}

function resolveTitle(messageType: ReminderPushPayload['messageType']) {
  if (messageType === 'solar-term') {
    return '节气切换提醒'
  }
  if (messageType === 'daily') {
    return '每日陪伴提醒'
  }
  return '节气灵宠提醒'
}

export function buildMessage(payload: ReminderPushPayload) {
  const cityName = payload.cityName?.trim() || '当前城市'
  const reminderTime = payload.reminderTime?.trim() || '20:30'
  const title = resolveTitle(payload.messageType)
  const lines = [`城市：${cityName}`, `时间：${reminderTime}`]

  if (payload.messageType === 'solar-term') {
    const solarTermName = payload.solarTermName?.trim() || '新节气'
    lines.unshift(`今天进入 ${solarTermName}，记得和灵宠打个招呼。`)
  } else if (payload.messageType === 'daily') {
    lines.unshift('今天还没陪伴灵宠的话，记得来完成一次互动。')
  } else {
    const dailyText = payload.dailyReminderEnabled ? '每日提醒：开启' : '每日提醒：关闭'
    const solarText = payload.solarTermReminderEnabled ? '节气提醒：开启' : '节气提醒：关闭'
    lines.unshift('测试提醒已触发')
    lines.push(dailyText, solarText)
  }

  return {
    title,
    body: lines.join('\n'),
  }
}

async function pushByBark(deviceUrl: string, title: string, body: string) {
  const safeUrl = deviceUrl.endsWith('/') ? deviceUrl.slice(0, -1) : deviceUrl
  const response = await fetch(`${safeUrl}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`, {
    method: 'GET',
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Bark 推送失败: ${response.status} ${text}`)
  }
  return { provider: 'bark', raw: text }
}

async function pushByServerChan(sendKey: string, title: string, body: string) {
  const response = await fetch(`https://sctapi.ftqq.com/${sendKey}.send`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title,
      desp: body.replace(/\n/g, '\n\n'),
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Server酱推送失败: ${response.status}`)
  }
  if (data && typeof data.code === 'number' && data.code !== 0) {
    throw new Error(`Server酱返回错误: ${data.message ?? 'unknown error'}`)
  }
  return { provider: 'serverchan', raw: data }
}

async function pushByCustomWebhook(url: string, title: string, body: string, payload: ReminderPushPayload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title,
      body,
      payload,
      source: 'seasonal-spirit-pets/reminder-push',
    }),
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`自定义 webhook 推送失败: ${response.status} ${text}`)
  }
  return { provider: 'custom-webhook', raw: text }
}

export async function dispatchPush(payload: ReminderPushPayload) {
  const { title, body } = buildMessage(payload)
  const channel = (Deno.env.get('PUSH_CHANNEL')?.trim() || 'bark') as PushChannel

  let result: Record<string, unknown>
  if (channel === 'bark') {
    const barkDeviceUrl = Deno.env.get('BARK_DEVICE_URL')?.trim() ?? ''
    if (!barkDeviceUrl) {
      throw new Error('missing_bark_device_url')
    }
    result = await pushByBark(barkDeviceUrl, title, body)
  } else if (channel === 'serverchan') {
    const sendKey = Deno.env.get('SERVERCHAN_SENDKEY')?.trim() ?? ''
    if (!sendKey) {
      throw new Error('missing_serverchan_sendkey')
    }
    result = await pushByServerChan(sendKey, title, body)
  } else {
    const customWebhookUrl = Deno.env.get('CUSTOM_PUSH_WEBHOOK_URL')?.trim() ?? ''
    if (!customWebhookUrl) {
      throw new Error('missing_custom_push_webhook_url')
    }
    result = await pushByCustomWebhook(customWebhookUrl, title, body, payload)
  }

  return { channel, title, body, result }
}
