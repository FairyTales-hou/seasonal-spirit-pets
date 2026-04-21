import type { ReminderSubscriptionChannel, ReminderSubscriptionStatus } from '@/types/home'

const DAILY_TEMPLATE_ID = import.meta.env.VITE_WX_DAILY_TEMPLATE_ID?.trim() ?? ''
const SOLAR_TEMPLATE_ID = import.meta.env.VITE_WX_SOLAR_TEMPLATE_ID?.trim() ?? ''
const PUSH_WEBHOOK = import.meta.env.VITE_REMINDER_PUSH_WEBHOOK?.trim() ?? ''
const PUSH_WEBHOOK_TOKEN = import.meta.env.VITE_REMINDER_PUSH_TOKEN?.trim() ?? ''

export interface ReminderPermissionResult {
  status: ReminderSubscriptionStatus
  channel: ReminderSubscriptionChannel
  updatedAt: string
  message: string
}

export interface ReminderPushResult {
  pushed: boolean
  message: string
}

export interface ReminderPushPayload {
  userId?: string
  cityName: string
  reminderTime: string
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
}

function nowIsoString() {
  return new Date().toISOString()
}

function getWeixinTemplateIds() {
  return [DAILY_TEMPLATE_ID, SOLAR_TEMPLATE_ID].filter(Boolean)
}

export function canRequestReminderPermission() {
  // #ifdef MP-WEIXIN
  return getWeixinTemplateIds().length > 0
  // #endif

  // #ifdef H5
  return typeof Notification !== 'undefined'
  // #endif

  return false
}

export async function requestReminderPermission(): Promise<ReminderPermissionResult> {
  const updatedAt = nowIsoString()

  // #ifdef MP-WEIXIN
  const templateIds = getWeixinTemplateIds()
  if (templateIds.length === 0) {
    return {
      status: 'denied',
      channel: 'wechat-subscribe',
      updatedAt,
      message: '未配置微信订阅模板 ID，请先配置 VITE_WX_DAILY_TEMPLATE_ID / VITE_WX_SOLAR_TEMPLATE_ID。',
    }
  }

  return new Promise((resolve) => {
    ;(uni as any).requestSubscribeMessage({
      tmplIds: templateIds,
      success: (result: Record<string, string>) => {
        const values = Object.values(result)
        const accepted = values.some((value) => value === 'accept')
        resolve({
          status: accepted ? 'granted' : 'denied',
          channel: 'wechat-subscribe',
          updatedAt,
          message: accepted ? '订阅授权成功，后续可接收提醒。' : '你已拒绝订阅提醒，可在设置中再次授权。',
        })
      },
      fail: (error: unknown) => {
        console.warn('[reminder] requestSubscribeMessage failed', error)
        resolve({
          status: 'denied',
          channel: 'wechat-subscribe',
          updatedAt,
          message: '订阅授权失败，请稍后重试。',
        })
      },
    })
  })
  // #endif

  // #ifdef H5
  if (typeof Notification === 'undefined') {
    return {
      status: 'unsupported',
      channel: 'none',
      updatedAt,
      message: '当前浏览器不支持通知提醒。',
    }
  }

  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    return {
      status: 'granted',
      channel: 'web-notification',
      updatedAt,
      message: '浏览器通知授权成功。',
    }
  }

  if (permission === 'denied') {
    return {
      status: 'denied',
      channel: 'web-notification',
      updatedAt,
      message: '浏览器通知被拒绝，请在浏览器设置里重新开启。',
    }
  }

  return {
    status: 'unknown',
    channel: 'web-notification',
    updatedAt,
    message: '通知授权已取消。',
  }
  // #endif

  return {
    status: 'unsupported',
    channel: 'none',
    updatedAt,
    message: '当前平台暂不支持订阅提醒。',
  }
}

async function callPushWebhook(payload: ReminderPushPayload): Promise<ReminderPushResult> {
  return new Promise((resolve) => {
    uni.request({
      url: PUSH_WEBHOOK,
      method: 'POST',
      timeout: 8000,
      header: {
        'content-type': 'application/json',
        ...(PUSH_WEBHOOK_TOKEN ? { 'x-reminder-token': PUSH_WEBHOOK_TOKEN } : {}),
      },
      data: payload,
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({ pushed: true, message: '测试推送已发送，请留意消息通知。' })
          return
        }
        resolve({
          pushed: false,
          message: `推送服务响应异常（${response.statusCode}）。`,
        })
      },
      fail: (error) => {
        console.warn('[reminder] push webhook failed', error)
        resolve({
          pushed: false,
          message: '推送服务请求失败，请检查 VITE_REMINDER_PUSH_WEBHOOK 配置。',
        })
      },
    })
  })
}

function sendBrowserPreviewNotification() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return false
  }

  const notification = new Notification('节气灵宠提醒', {
    body: '测试提醒已触发：记得和今日灵宠互动一下。',
  })

  setTimeout(() => {
    notification.close()
  }, 5000)

  return true
}

export async function pushReminderPreview(payload: ReminderPushPayload): Promise<ReminderPushResult> {
  if (PUSH_WEBHOOK) {
    return callPushWebhook(payload)
  }

  // #ifdef H5
  if (sendBrowserPreviewNotification()) {
    return { pushed: true, message: '浏览器测试提醒已发送。' }
  }
  // #endif

  return {
    pushed: false,
    message: '未配置推送服务地址，已保存订阅设置。请配置 VITE_REMINDER_PUSH_WEBHOOK 以启用真实推送。',
  }
}
