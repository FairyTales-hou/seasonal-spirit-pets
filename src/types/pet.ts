export type PetMood = 'calm' | 'sunny' | 'rainy' | 'sleepy'
export type PetSeason = 'spring' | 'summer' | 'autumn' | 'winter'

export interface PetProfile {
  id: string
  solarTerm: string
  name: string
  spirit: string
  colors: string[]
  elements: string[]
  personality: string[]
  quote: string
  adviceStyle: string
  season: PetSeason
  unlocked: boolean
  mood: PetMood
}

export interface PetDetailRouteQuery {
  id?: string
}
