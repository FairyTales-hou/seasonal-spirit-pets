import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  : null

export async function ensureAnonymousUserId(): Promise<string | null> {
  if (!supabase) {
    return null
  }

  const currentSession = await supabase.auth.getSession()
  const existingUserId = currentSession.data.session?.user.id
  if (existingUserId) {
    return existingUserId
  }

  const signInResult = await supabase.auth.signInAnonymously()
  return signInResult.data.user?.id ?? null
}
