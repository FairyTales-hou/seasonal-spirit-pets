import { defineStore } from 'pinia'
import type { RecordEntry } from '@/types/home'
import type { ReminderSubscriptionChannel, ReminderSubscriptionStatus } from '@/types/home'
import { HOME_DATA, INTERACTION_BUBBLES } from '@/mock/home'
import { PETS } from '@/mock/pets'
import { getSolarTermContent } from '@/mock/solar-term-content'
import { formatDateChinese, getCurrentSolarTerm, getWeekdayChinese, toDateKey } from '@/utils/date'
import { getCity } from '@/utils/location'
import { getWeatherSummary } from '@/services/weather'
import { getAlmanacContent } from '@/services/almanac'
import { getDynamicPetBubble } from '@/services/pet-bubble'
import { ensureAnonymousUserId, isSupabaseEnabled } from '@/services/supabase'
import { fetchHomeProfile, upsertHomeProfile, type HomeProfilePayload } from '@/services/home-profile'

const HOME_STORAGE_KEY = 'seasonal-spirit-pets:home'
const GROWTH_REWARD = 8
const MAX_RECORD_ENTRIES = 24
const MILESTONE_STEPS = [3, 7, 14]

const BASE_UNLOCKED_IDS = PETS.filter((pet) => pet.unlocked).map((pet) => pet.id)
const MAX_UNLOCK_PROGRESS = Math.max(0, PETS.length - BASE_UNLOCKED_IDS.length)

interface HomeStorageState {
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
  petUnlockProgress: number
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

function clampUnlockProgress(value: number) {
  return Math.min(Math.max(value, 0), MAX_UNLOCK_PROGRESS)
}

function buildUnlockedPetIds(progress: number) {
  const unlockedCount = BASE_UNLOCKED_IDS.length + clampUnlockProgress(progress)
  return PETS.slice(0, unlockedCount).map((pet) => pet.id)
}

function getUnlockProgressByPetId(petId: string) {
  const currentIndex = PETS.findIndex((pet) => pet.id === petId)
  if (currentIndex < 0) {
    return 0
  }

  // Keep all already passed solar-term pets unlocked.
  return clampUnlockProgress(currentIndex + 1 - BASE_UNLOCKED_IDS.length)
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    homeData: { ...HOME_DATA },
    favoritePetIds: [] as string[],
    lastInteractDate: '',
    recordEntries: [] as RecordEntry[],
    cloudUserId: '' as string,
    petUnlockProgress: 0,
    unlockedPetIds: buildUnlockedPetIds(0),
  }),
  actions: {
    refreshUnlockedPetIds() {
      this.unlockedPetIds = buildUnlockedPetIds(this.petUnlockProgress)
    },
    isPetUnlocked(petId: string) {
      return this.unlockedPetIds.includes(petId) || petId === this.homeData.petId
    },
    normalizeHydratedState(savedState: HydrateResult | undefined) {
      if (!savedState) {
        return
      }

      if (typeof savedState.interactionDone === 'boolean') {
        this.homeData.interactionDone = savedState.interactionDone
      }

      if (typeof savedState.growthValue === 'number') {
        this.homeData.growthValue = savedState.growthValue
      }

      if (typeof savedState.streakDays === 'number') {
        this.homeData.streakDays = savedState.streakDays
      }

      if (typeof savedState.petBubble === 'string' && savedState.petBubble) {
        this.homeData.petBubble = savedState.petBubble
      }

      if (typeof savedState.cityName === 'string' && savedState.cityName) {
        this.homeData.cityName = savedState.cityName
      }

      if (typeof savedState.reminderEnabled === 'boolean') {
        this.homeData.reminderEnabled = savedState.reminderEnabled
      }

      if (typeof savedState.dailyReminderEnabled === 'boolean') {
        this.homeData.dailyReminderEnabled = savedState.dailyReminderEnabled
      }

      if (typeof savedState.solarTermReminderEnabled === 'boolean') {
        this.homeData.solarTermReminderEnabled = savedState.solarTermReminderEnabled
      }

      if (typeof savedState.reminderTime === 'string' && savedState.reminderTime) {
        this.homeData.reminderTime = savedState.reminderTime
      }

      if (
        savedState.reminderSubscriptionStatus === 'granted' ||
        savedState.reminderSubscriptionStatus === 'denied' ||
        savedState.reminderSubscriptionStatus === 'unsupported'
      ) {
        this.homeData.reminderSubscriptionStatus = savedState.reminderSubscriptionStatus
      } else if (savedState.reminderSubscriptionStatus === 'unknown') {
        this.homeData.reminderSubscriptionStatus = 'unknown'
      }

      if (
        savedState.reminderSubscriptionChannel === 'wechat-subscribe' ||
        savedState.reminderSubscriptionChannel === 'web-notification'
      ) {
        this.homeData.reminderSubscriptionChannel = savedState.reminderSubscriptionChannel
      } else if (savedState.reminderSubscriptionChannel === 'none') {
        this.homeData.reminderSubscriptionChannel = 'none'
      }

      if (typeof savedState.reminderSubscriptionUpdatedAt === 'string') {
        this.homeData.reminderSubscriptionUpdatedAt = savedState.reminderSubscriptionUpdatedAt
      }

      if (typeof savedState.petUnlockProgress === 'number') {
        this.petUnlockProgress = clampUnlockProgress(savedState.petUnlockProgress)
      }

      const todayKey = toDateKey(new Date())
      const lastDate = typeof savedState.lastInteractDate === 'string' ? savedState.lastInteractDate : ''
      if (lastDate) {
        this.lastInteractDate = lastDate
      }
      if (lastDate && lastDate !== todayKey) {
        this.homeData.interactionDone = false
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        if (lastDate !== toDateKey(yesterday)) {
          this.homeData.streakDays = 0
        }
      }

      const favoritePetIds = savedState.favoritePetIds
      if (Array.isArray(favoritePetIds)) {
        this.favoritePetIds = favoritePetIds.filter((item): item is string => typeof item === 'string')
      }

      this.recordEntries = normalizeRecordEntries(savedState.recordEntries)
      this.refreshUnlockedPetIds()
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

        await this.persist()
      } catch (error) {
        console.warn('[supabase] hydrate 失败，使用本地数据', error)
      }
    },
    async saveCity(cityName: string) {
      const nextCityName = cityName.trim()
      if (!nextCityName) {
        throw new Error('城市不能为空')
      }

      this.homeData.cityName = nextCityName
      await this.persist()
    },
    async refreshWeatherByCity() {
      try {
        const weather = await getWeatherSummary({
          location: this.homeData.cityName,
          fallbackCityName: this.homeData.cityName,
        })
        const displayCity = weather.cityName || this.homeData.cityName
        this.homeData.cityName = displayCity
        this.homeData.weatherSummary = `${displayCity} · ${weather.text} ${weather.temp}°C`
        this.homeData.weatherBubble = `${weather.text} · ${weather.temp}°C`
        await this.persist()
        return true
      } catch (error) {
        console.warn('[weather] 手动城市刷新失败，保留当前城市', error)
        await this.persist()
        return false
      }
    },
    async saveReminderSettings(payload: {
      reminderEnabled: boolean
      dailyReminderEnabled: boolean
      solarTermReminderEnabled: boolean
      reminderTime: string
      reminderSubscriptionStatus?: ReminderSubscriptionStatus
      reminderSubscriptionChannel?: ReminderSubscriptionChannel
      reminderSubscriptionUpdatedAt?: string
    }) {
      this.homeData.reminderEnabled = payload.reminderEnabled
      this.homeData.dailyReminderEnabled = payload.dailyReminderEnabled
      this.homeData.solarTermReminderEnabled = payload.solarTermReminderEnabled
      this.homeData.reminderTime = payload.reminderTime
      if (payload.reminderSubscriptionStatus) {
        this.homeData.reminderSubscriptionStatus = payload.reminderSubscriptionStatus
      }
      if (payload.reminderSubscriptionChannel) {
        this.homeData.reminderSubscriptionChannel = payload.reminderSubscriptionChannel
      }
      if (typeof payload.reminderSubscriptionUpdatedAt === 'string') {
        this.homeData.reminderSubscriptionUpdatedAt = payload.reminderSubscriptionUpdatedAt
      }
      await this.persist()
    },
    interact(action: string) {
      if (this.homeData.interactionDone) {
        return null
      }

      const dateKey = toDateKey(new Date())
      const bubble = INTERACTION_BUBBLES[Math.floor(Math.random() * INTERACTION_BUBBLES.length)]
      const rawGrowthValue = this.homeData.growthValue + GROWTH_REWARD
      const levelReached = rawGrowthValue >= this.homeData.nextLevelGrowth
      const growthValue = levelReached ? rawGrowthValue - this.homeData.nextLevelGrowth : rawGrowthValue
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

      if (levelReached) {
        if (this.petUnlockProgress < MAX_UNLOCK_PROGRESS) {
          this.petUnlockProgress += 1
          this.refreshUnlockedPetIds()

          const unlockedPetId = this.unlockedPetIds[this.unlockedPetIds.length - 1]
          const unlockedPet = PETS.find((pet) => pet.id === unlockedPetId)
          if (unlockedPet) {
            milestoneEntries.push(
              createMilestoneRecord(
                dateKey,
                `升级成功，解锁「${unlockedPet.name}」`,
                `成长值达到 ${this.homeData.nextLevelGrowth}，图鉴新增 ${unlockedPet.solarTerm} 灵宠。`,
              ),
            )
          }
        } else {
          milestoneEntries.push(
            createMilestoneRecord(
              dateKey,
              '成长值达到阈值',
              '当前图鉴已经全部解锁，继续陪伴会留下更多互动记录。',
            ),
          )
        }
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
      this.recordEntries = [interactionEntry, ...milestoneEntries, ...this.recordEntries].slice(0, MAX_RECORD_ENTRIES)

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
      this.homeData.weekdayText = getWeekdayChinese(now)
      this.homeData.solarTerm = term.name
      this.homeData.solarTermTagline = term.tagline
      this.homeData.petId = term.id
      this.homeData.daysUntilNextTerm = daysUntilNext
      this.homeData.suggestions = getSolarTermContent(term.id).suggestions

      const currentTermProgress = getUnlockProgressByPetId(term.id)
      if (currentTermProgress > this.petUnlockProgress) {
        this.petUnlockProgress = currentTermProgress
        this.refreshUnlockedPetIds()
      }

      try {
        this.homeData.almanac = getAlmanacContent(now, term.name)
      } catch (error) {
        console.warn('[almanac] 生成失败，隐藏今日黄历卡', error)
        this.homeData.almanac = null
      }

      const todayKey = toDateKey(now)
      if (this.recordEntries.length === 0) {
        this.recordEntries = [createSeedRecord(todayKey, term.name)]
      }

      try {
        const query = await getCity(this.homeData.cityName)
        const weather = await getWeatherSummary(query)
        const displayCity = weather.cityName || this.homeData.cityName
        this.homeData.cityName = displayCity
        this.homeData.weatherSummary = `${displayCity} · ${weather.text} ${weather.temp}°C`
        this.homeData.weatherBubble = `${weather.text} · ${weather.temp}°C`
      } catch (e) {
        console.warn('[weather] 获取失败，保留当前天气数据', e)
      }

      const currentPet = PETS.find((item) => item.id === term.id)
      if (!this.homeData.interactionDone || this.lastInteractDate !== todayKey) {
        this.homeData.petBubble = getDynamicPetBubble({
          date: now,
          solarTerm: term.name,
          petName: currentPet?.name ?? '???',
          solarTermTagline: term.tagline,
          weatherSummary: this.homeData.weatherSummary,
          weatherBubble: this.homeData.weatherBubble,
        })
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
        reminderEnabled: this.homeData.reminderEnabled,
        dailyReminderEnabled: this.homeData.dailyReminderEnabled,
        solarTermReminderEnabled: this.homeData.solarTermReminderEnabled,
        reminderTime: this.homeData.reminderTime,
        reminderSubscriptionStatus: this.homeData.reminderSubscriptionStatus,
        reminderSubscriptionChannel: this.homeData.reminderSubscriptionChannel,
        reminderSubscriptionUpdatedAt: this.homeData.reminderSubscriptionUpdatedAt,
      }
    },
    persistLocal() {
      uni.setStorageSync(HOME_STORAGE_KEY, {
        ...this.buildPersistPayload(),
        petUnlockProgress: this.petUnlockProgress,
      } satisfies HomeStorageState)
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
