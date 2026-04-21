import { supabase } from '@/services/supabase'
import type { RecordEntry } from '@/types/home'
import type { ReminderSubscriptionChannel, ReminderSubscriptionStatus } from '@/types/home'

export interface HomeProfilePayload {
  interactionDone: boolean
  growthValue: number
  streakDays: number
  petBubble: string
  favoritePetIds: string[]
  cityName: string
  lastInteractDate: string
  recordEntries: RecordEntry[]
  reminderEnabled: boolean
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
  reminderTime: string
  reminderSubscriptionStatus: ReminderSubscriptionStatus
  reminderSubscriptionChannel: ReminderSubscriptionChannel
  reminderSubscriptionUpdatedAt: string
}

interface HomeProfileRow {
  interaction_done: boolean
  growth_value: number
  streak_days: number
  pet_bubble: string
  favorite_pet_ids: string[]
  city_name: string
  last_interact_date: string
  record_entries: RecordEntry[]
  reminder_enabled?: boolean
  daily_reminder_enabled?: boolean
  solar_term_reminder_enabled?: boolean
  reminder_time?: string
  reminder_subscription_status?: ReminderSubscriptionStatus
  reminder_subscription_channel?: ReminderSubscriptionChannel
  reminder_subscription_updated_at?: string
}

const TABLE_NAME = 'home_profiles'

function toPayload(row: HomeProfileRow): HomeProfilePayload {
  return {
    interactionDone: row.interaction_done,
    growthValue: row.growth_value,
    streakDays: row.streak_days,
    petBubble: row.pet_bubble,
    favoritePetIds: Array.isArray(row.favorite_pet_ids) ? row.favorite_pet_ids : [],
    cityName: row.city_name,
    lastInteractDate: row.last_interact_date,
    recordEntries: Array.isArray(row.record_entries) ? row.record_entries : [],
    reminderEnabled: typeof row.reminder_enabled === 'boolean' ? row.reminder_enabled : true,
    dailyReminderEnabled: typeof row.daily_reminder_enabled === 'boolean' ? row.daily_reminder_enabled : true,
    solarTermReminderEnabled: typeof row.solar_term_reminder_enabled === 'boolean' ? row.solar_term_reminder_enabled : true,
    reminderTime: typeof row.reminder_time === 'string' ? row.reminder_time : '20:30',
    reminderSubscriptionStatus:
      row.reminder_subscription_status === 'granted' ||
      row.reminder_subscription_status === 'denied' ||
      row.reminder_subscription_status === 'unsupported'
        ? row.reminder_subscription_status
        : 'unknown',
    reminderSubscriptionChannel:
      row.reminder_subscription_channel === 'wechat-subscribe' || row.reminder_subscription_channel === 'web-notification'
        ? row.reminder_subscription_channel
        : 'none',
    reminderSubscriptionUpdatedAt:
      typeof row.reminder_subscription_updated_at === 'string' ? row.reminder_subscription_updated_at : '',
  }
}

function toRow(payload: HomeProfilePayload): HomeProfileRow {
  return {
    interaction_done: payload.interactionDone,
    growth_value: payload.growthValue,
    streak_days: payload.streakDays,
    pet_bubble: payload.petBubble,
    favorite_pet_ids: payload.favoritePetIds,
    city_name: payload.cityName,
    last_interact_date: payload.lastInteractDate,
    record_entries: payload.recordEntries,
    reminder_enabled: payload.reminderEnabled,
    daily_reminder_enabled: payload.dailyReminderEnabled,
    solar_term_reminder_enabled: payload.solarTermReminderEnabled,
    reminder_time: payload.reminderTime,
    reminder_subscription_status: payload.reminderSubscriptionStatus,
    reminder_subscription_channel: payload.reminderSubscriptionChannel,
    reminder_subscription_updated_at: payload.reminderSubscriptionUpdatedAt,
  }
}

export async function fetchHomeProfile(userId: string): Promise<HomeProfilePayload | null> {
  if (!supabase) {
    return null
  }

  const result = await supabase.from(TABLE_NAME).select('*').eq('user_id', userId).maybeSingle<HomeProfileRow>()

  if (result.error) {
    throw result.error
  }

  if (!result.data) {
    return null
  }

  return toPayload(result.data)
}

export async function upsertHomeProfile(userId: string, payload: HomeProfilePayload) {
  if (!supabase) {
    return
  }

  const result = await supabase
    .from(TABLE_NAME)
    .upsert({
      user_id: userId,
      ...toRow(payload),
    })

  if (result.error) {
    throw result.error
  }
}
