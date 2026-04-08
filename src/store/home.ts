import { defineStore } from 'pinia'
import { HOME_DATA, INTERACTION_BUBBLES } from '@/mock/home'
import { getSolarTermContent } from '@/mock/solar-term-content'
import { formatDateChinese, getCurrentSolarTerm, toDateKey } from '@/utils/date'
import { getCity } from '@/utils/location'
import { getWeatherSummary } from '@/services/weather'

const HOME_STORAGE_KEY = 'seasonal-spirit-pets:home'
const GROWTH_REWARD = 8

interface HomeStorageState {
  interactionDone: boolean
  growthValue: number
  streakDays: number
  petBubble: string
  favoritePetIds: string[]
  cityName: string
  lastInteractDate: string
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    homeData: { ...HOME_DATA },
    favoritePetIds: [] as string[],
    lastInteractDate: '',
  }),
  actions: {
    hydrate() {
      const savedState = uni.getStorageSync(HOME_STORAGE_KEY) as Partial<HomeStorageState> | undefined

      if (typeof savedState?.interactionDone === 'boolean') {
        this.homeData.interactionDone = savedState.interactionDone
      }

      if (typeof savedState?.growthValue === 'number') {
        this.homeData.growthValue = savedState.growthValue
      }

      if (typeof savedState?.streakDays === 'number') {
        this.homeData.streakDays = savedState.streakDays
      }

      if (typeof savedState?.petBubble === 'string' && savedState.petBubble) {
        this.homeData.petBubble = savedState.petBubble
      }

      if (typeof savedState?.cityName === 'string' && savedState.cityName) {
        this.homeData.cityName = savedState.cityName
      }

      const todayKey = toDateKey(new Date())
      const lastDate = typeof savedState?.lastInteractDate === 'string' ? savedState.lastInteractDate : ''
      if (lastDate && lastDate !== todayKey) {
        this.homeData.interactionDone = false
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        if (lastDate !== toDateKey(yesterday)) {
          this.homeData.streakDays = 0
        }
      } else if (lastDate) {
        this.lastInteractDate = lastDate
      }

      const favoritePetIds = savedState?.favoritePetIds

      if (Array.isArray(favoritePetIds)) {
        this.favoritePetIds = favoritePetIds.filter((item): item is string => typeof item === 'string')
      }
    },
    interact(action: string) {
      if (this.homeData.interactionDone) {
        return null
      }

      const bubble = INTERACTION_BUBBLES[Math.floor(Math.random() * INTERACTION_BUBBLES.length)]
      const growthValue = Math.min(this.homeData.growthValue + GROWTH_REWARD, this.homeData.nextLevelGrowth)

      this.homeData = {
        ...this.homeData,
        interactionDone: true,
        growthValue,
        streakDays: this.homeData.streakDays + 1,
        petBubble: bubble,
      }
      this.lastInteractDate = toDateKey(new Date())

      this.persist()

      return `${action}之后，成长值 +${GROWTH_REWARD}。${bubble}`
    },
    toggleFavoritePet(petId: string) {
      this.favoritePetIds = this.favoritePetIds.includes(petId)
        ? this.favoritePetIds.filter((item) => item !== petId)
        : [...this.favoritePetIds, petId]

      this.persist()
    },
    isFavoritePet(petId: string) {
      return this.favoritePetIds.includes(petId)
    },
    async refreshLiveData() {
      const now = new Date()
      const { term, daysUntilNext } = getCurrentSolarTerm(now)

      this.homeData.dateText = formatDateChinese(now)
      this.homeData.solarTerm = term.name
      this.homeData.solarTermTagline = term.tagline
      this.homeData.petId = term.id
      this.homeData.daysUntilNextTerm = daysUntilNext
      this.homeData.suggestions = getSolarTermContent(term.id).suggestions

      try {
        const query = await getCity(this.homeData.cityName)
        const weather = await getWeatherSummary(query)
        const displayCity = weather.cityName || this.homeData.cityName
        this.homeData.cityName = displayCity
        this.homeData.weatherSummary = `${displayCity} · ${weather.text} ${weather.temp}°C`
        this.persist()
      } catch (e) {
        console.warn('[weather] 获取失败，保留上次数据', e)
      }
    },
    persist() {
      uni.setStorageSync(HOME_STORAGE_KEY, {
        interactionDone: this.homeData.interactionDone,
        growthValue: this.homeData.growthValue,
        streakDays: this.homeData.streakDays,
        petBubble: this.homeData.petBubble,
        favoritePetIds: this.favoritePetIds,
        cityName: this.homeData.cityName,
        lastInteractDate: this.lastInteractDate,
      })
    },
  },
})
