import { supabase } from '@/services/supabase'
import type { RecordEntry } from '@/types/home'

export interface HomeProfilePayload {
  interactionDone: boolean
  growthValue: number
  streakDays: number
  petBubble: string
  favoritePetIds: string[]
  cityName: string
  lastInteractDate: string
  recordEntries: RecordEntry[]
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
