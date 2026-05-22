export type SuggestionType = 'wear' | 'food' | 'reminder'

export interface SuggestionSummary {
  type: SuggestionType
  title: string
  content: string
}

export interface AlmanacSummary {
  lunarText: string
  suitableActivities: string[]
  unsuitableActivities: string[]
  seasonalHint: string
}

export interface HomeData {
  dateText: string
  weekdayText?: string
  solarTerm: string
  solarTermTagline: string
  daysUntilNextTerm: number
  weatherSummary: string
  cityName: string
  petId: string
  petBubble: string
  suggestions: SuggestionSummary[]
  almanac: AlmanacSummary | null
  growthValue: number
  nextLevelGrowth: number
  streakDays: number
  interactionDone: boolean
  reminderEnabled: boolean
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
  reminderTime: string
  reminderSubscriptionStatus: ReminderSubscriptionStatus
  reminderSubscriptionChannel: ReminderSubscriptionChannel
  reminderSubscriptionUpdatedAt: string
}

export type ReminderSubscriptionStatus = 'unknown' | 'granted' | 'denied' | 'unsupported'

export type ReminderSubscriptionChannel = 'none' | 'wechat-subscribe' | 'web-notification'

export interface DetailedSuggestionSection {
  title: string
  content: string
}

export type RecordEntryType = 'system' | 'interaction' | 'milestone'

export interface RecordEntry {
  id: string
  dateKey: string
  type: RecordEntryType
  badge: string
  title: string
  content: string
}

export interface MineActionItem {
  title: string
  description: string
  route: string
}
