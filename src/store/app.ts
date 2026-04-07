import { defineStore } from 'pinia'

const APP_STORAGE_KEY = 'seasonal-spirit-pets:app'

interface AppStorageState {
  hasOnboarded: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppStorageState => ({
    hasOnboarded: false,
  }),
  actions: {
    hydrate() {
      const savedState = uni.getStorageSync(APP_STORAGE_KEY) as Partial<AppStorageState> | undefined

      if (typeof savedState?.hasOnboarded === 'boolean') {
        this.hasOnboarded = savedState.hasOnboarded
      }
    },
    completeOnboarding() {
      this.hasOnboarded = true
      this.persist()
    },
    persist() {
      uni.setStorageSync(APP_STORAGE_KEY, {
        hasOnboarded: this.hasOnboarded,
      })
    },
  },
})
