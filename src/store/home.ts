import { defineStore } from 'pinia'
import type { RecordEntry } from '@/types/home'
import { HOME_DATA, INTERACTION_BUBBLES } from '@/mock/home'
import { getSolarTermContent } from '@/mock/solar-term-content'
import { formatDateChinese, getCurrentSolarTerm, toDateKey } from '@/utils/date'
import { getCity } from '@/utils/location'
import { getWeatherSummary } from '@/services/weather'
import { ensureAnonymousUserId, isSupabaseEnabled } from '@/services/supabase'
import { fetchHomeProfile, upsertHomeProfile, type HomeProfilePayload } from '@/services/home-profile'

const HOME_STORAGE_KEY = 'seasonal-spirit-pets:home'
const GROWTH_REWARD = 8
const MAX_RECORD_ENTRIES = 24
const MILESTONE_STEPS = [3, 7, 14]

interface HomeStorageState {
  interactionDone: boolean
  growthValue: number
  streakDays: number
  petBubble: string
  favoritePetIds: string[]
  cityName: string
  lastInteractDate: string
  recordEntries: RecordEntry[]
}

interface HydrateResult extends Partial<HomeStorageState> { }

function createRecordId(dateKey: string, kind: string) {
  return `${dateKey}-${kind}-${Math.random().toString(36).slice(2, 8)}`
}

function isRecordEntry(item: unknown): item is RecordEntry {
  if (!item || typeof item !== 'object') {
    return false
  }

  const candidate = item as RecordEntry
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.dateKey === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.badge === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.content === 'string'
  )
}

function normalizeRecordEntries(entries: unknown): RecordEntry[] {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries.filter(isRecordEntry).slice(0, MAX_RECORD_ENTRIES)
}

function createSeedRecord(dateKey: string, solarTerm: string): RecordEntry {
  return {
    id: createRecordId(dateKey, 'seed'),
    dateKey,
    type: 'system',
    badge: '今日',
    title: '节气灵宠已经准备好',
    content: `当前节气是 ${solarTerm}，今天开始的每一次陪伴都会被记录下来。`,
  }
}

function createMilestoneRecord(dateKey: string, title: string, content: string): RecordEntry {
  return {
    id: createRecordId(dateKey, 'milestone'),
    dateKey,
    type: 'milestone',
    badge: '成长节点',
    title,
    content,
  }
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    homeData: { ...HOME_DATA },
    favoritePetIds: [] as string[],
    lastInteractDate: '',
    recordEntries: [] as RecordEntry[],
    cloudUserId: '' as string,
  }),
  actions: {
    normalizeHydratedState(savedState: HydrateResult | undefined) {
      if (!savedState) {
        return
      }

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

      this.recordEntries = normalizeRecordEntries(savedState?.recordEntries)
    },
    async hydrate() {
      const localState = uni.getStorageSync(HOME_STORAGE_KEY) as Partial<HomeStorageState> | undefined
      this.normalizeHydratedState(localState)

      if (!isSupabaseEnabled) {
        return
      }

      try {
        const userId = await ensureAnonymousUserId()
        if (!userId) {
          return
        }
        this.cloudUserId = userId

        const cloudState = await fetchHomeProfile(userId)
        if (cloudState) {
          this.normalizeHydratedState(cloudState)
          this.persistLocal()
          return
        }

        // 首次云端登录时，把本地状态回写到 Supabase。
        await this.persist()
      } catch (error) {
        console.warn('[supabase] hydrate 失败，使用本地数据', error)
      }
    },
    interact(action: string) {
      if (this.homeData.interactionDone) {
        return null
      }

      const dateKey = toDateKey(new Date())
      const bubble = INTERACTION_BUBBLES[Math.floor(Math.random() * INTERACTION_BUBBLES.length)]
      const growthValue = Math.min(this.homeData.growthValue + GROWTH_REWARD, this.homeData.nextLevelGrowth)
      const nextStreakDays = this.homeData.streakDays + 1
      const milestoneEntries: RecordEntry[] = []

      if (MILESTONE_STEPS.includes(nextStreakDays)) {
        milestoneEntries.push(
          createMilestoneRecord(
            dateKey,
            `连续陪伴 ${nextStreakDays} 天`,
            `连续 ${nextStreakDays} 天都完成了互动，灵宠已经开始记住你的节奏。`,
          ),
        )
      }

      if (growthValue === this.homeData.nextLevelGrowth) {
        milestoneEntries.push(
          createMilestoneRecord(
            dateKey,
            '成长值抵达当前阶段上限',
            `成长值已经来到 ${growthValue}，下一步可以继续把陪伴积累成新的阶段。`,
          ),
        )
      }

      this.homeData = {
        ...this.homeData,
        interactionDone: true,
        growthValue,
        streakDays: nextStreakDays,
        petBubble: bubble,
      }
      this.lastInteractDate = dateKey
      const interactionEntry: RecordEntry = {
        id: createRecordId(dateKey, 'interaction'),
        dateKey,
        type: 'interaction',
        badge: '今日互动',
        title: `完成「${action}」`,
        content: `今天和 ${this.homeData.solarTerm} 灵宠一起完成了一次陪伴，成长值 +${GROWTH_REWARD}。`,
      }
      this.recordEntries = [
        interactionEntry,
        ...milestoneEntries,
        ...this.recordEntries,
      ].slice(0, MAX_RECORD_ENTRIES)

      void this.persist()

      return `${action}之后，成长值 +${GROWTH_REWARD}。${bubble}`
    },
    toggleFavoritePet(petId: string) {
      this.favoritePetIds = this.favoritePetIds.includes(petId)
        ? this.favoritePetIds.filter((item) => item !== petId)
        : [...this.favoritePetIds, petId]

      void this.persist()
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

      if (this.recordEntries.length === 0) {
        this.recordEntries = [createSeedRecord(toDateKey(now), term.name)]
      }

      try {
        const query = await getCity(this.homeData.cityName)
        const weather = await getWeatherSummary(query)
        const displayCity = weather.cityName || this.homeData.cityName
        this.homeData.cityName = displayCity
        this.homeData.weatherSummary = `${displayCity} · ${weather.text} ${weather.temp}°C`
      } catch (e) {
        console.warn('[weather] 获取失败，保留上一次天气数据', e)
      }

      void this.persist()
    },
    buildPersistPayload(): HomeProfilePayload {
      return {
        interactionDone: this.homeData.interactionDone,
        growthValue: this.homeData.growthValue,
        streakDays: this.homeData.streakDays,
        petBubble: this.homeData.petBubble,
        favoritePetIds: this.favoritePetIds,
        cityName: this.homeData.cityName,
        lastInteractDate: this.lastInteractDate,
        recordEntries: this.recordEntries,
      }
    },
    persistLocal() {
      uni.setStorageSync(HOME_STORAGE_KEY, this.buildPersistPayload())
    },
    async persist() {
      const payload = this.buildPersistPayload()
      this.persistLocal()

      if (!isSupabaseEnabled) {
        return
      }

      try {
        if (!this.cloudUserId) {
          const userId = await ensureAnonymousUserId()
          if (!userId) {
            return
          }
          this.cloudUserId = userId
        }

        await upsertHomeProfile(this.cloudUserId, payload)
      } catch (error) {
        console.warn('[supabase] 同步失败，稍后会继续尝试', error)
      }
    },
  },
})
