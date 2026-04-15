import { ensureAnonymousUserId, isSupabaseEnabled, supabase } from '@/services/supabase'

export interface FeedbackPayload {
  category: string
  content: string
  contact: string
  cityName: string
  solarTerm: string
}

export async function submitFeedback(payload: FeedbackPayload) {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('SUPABASE_DISABLED')
  }

  const userId = await ensureAnonymousUserId()
  if (!userId) {
    throw new Error('ANONYMOUS_USER_UNAVAILABLE')
  }

  const result = await supabase.from('feedback_entries').insert({
    user_id: userId,
    category: payload.category,
    content: payload.content,
    contact: payload.contact,
    city_name: payload.cityName,
    solar_term: payload.solarTerm,
  })

  if (result.error) {
    throw result.error
  }
}
