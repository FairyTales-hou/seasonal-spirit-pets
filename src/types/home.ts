export type SuggestionType = 'wear' | 'food' | 'reminder'

export interface SuggestionSummary {
  type: SuggestionType
  title: string
  content: string
}

export interface HomeData {
  dateText: string
  solarTerm: string
  solarTermTagline: string
  daysUntilNextTerm: number
  weatherSummary: string
  cityName: string
  petId: string
  petBubble: string
  suggestions: SuggestionSummary[]
  growthValue: number
  nextLevelGrowth: number
  streakDays: number
  interactionDone: boolean
}

export interface DetailedSuggestionSection {
  title: string
  content: string
}

export interface MineActionItem {
  title: string
  description: string
  available: boolean
}
