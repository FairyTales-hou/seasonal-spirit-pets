<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useHome } from '@/composables/useHome'

const { homeData, saveReminderSettings } = useHome()
const saving = ref(false)
const statusText = ref('')
const hasLocalEdits = ref(false)
const isSyncingForm = ref(false)

const form = reactive({
  reminderEnabled: homeData.value.reminderEnabled,
  dailyReminderEnabled: homeData.value.dailyReminderEnabled,
  solarTermReminderEnabled: homeData.value.solarTermReminderEnabled,
  reminderTime: homeData.value.reminderTime,
})

function syncFormFromHomeData() {
  isSyncingForm.value = true
  form.reminderEnabled = homeData.value.reminderEnabled
  form.dailyReminderEnabled = homeData.value.dailyReminderEnabled
  form.solarTermReminderEnabled = homeData.value.solarTermReminderEnabled
  form.reminderTime = homeData.value.reminderTime
  isSyncingForm.value = false
}

watch(
  () => [
    homeData.value.reminderEnabled,
    homeData.value.dailyReminderEnabled,
    homeData.value.solarTermReminderEnabled,
    homeData.value.reminderTime,
  ],
  () => {
    if (!hasLocalEdits.value) {
      syncFormFromHomeData()
    }
  },
  { immediate: true },
)

watch(
  form,
  () => {
    if (!isSyncingForm.value) {
      hasLocalEdits.value = true
    }
  },
  { deep: true },
)

const childDisabled = computed(() => !form.reminderEnabled)

function getSwitchValue(event: Event) {
  return (event as { detail?: { value?: boolean } }).detail?.value ?? false
}

function handleReminderEnabledChange(event: Event) {
  form.reminderEnabled = getSwitchValue(event)
}

function handleDailyReminderChange(event: Event) {
  form.dailyReminderEnabled = getSwitchValue(event)
}

function handleSolarTermReminderChange(event: Event) {
  form.solarTermReminderEnabled = getSwitchValue(event)
}

async function handleSave() {
  saving.value = true
  statusText.value = ''

  try {
    await saveReminderSettings({
      reminderEnabled: form.reminderEnabled,
      dailyReminderEnabled: form.dailyReminderEnabled,
      solarTermReminderEnabled: form.solarTermReminderEnabled,
      reminderTime: form.reminderTime,
    })
    statusText.value = '提醒偏好已保存，当前版本仅保存设置，不会实际发送提醒。'
  } catch (error) {
    statusText.value = '提醒设置保存失败，请稍后再试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="container">
    <view class="card section-gap settings-card">
      <text class="settings-card__title">提醒设置</text>
      <text class="settings-card__desc">当前版本仅保存提醒偏好，后续会接入真实提醒能力。</text>

      <label class="setting-row">
        <text class="setting-row__label">总开关</text>
        <switch :checked="form.reminderEnabled" @change="handleReminderEnabledChange" />
      </label>

      <label class="setting-row" :class="{ 'setting-row--disabled': childDisabled }">
        <text class="setting-row__label">每日陪伴提醒</text>
        <switch :disabled="childDisabled" :checked="form.dailyReminderEnabled" @change="handleDailyReminderChange" />
      </label>

      <label class="setting-row" :class="{ 'setting-row--disabled': childDisabled }">
        <text class="setting-row__label">节气切换提醒</text>
        <switch :disabled="childDisabled" :checked="form.solarTermReminderEnabled" @change="handleSolarTermReminderChange" />
      </label>

      <view class="setting-time">
        <text class="setting-row__label">提醒时间</text>
        <input v-model="form.reminderTime" :disabled="childDisabled" class="settings-input" placeholder="20:30" />
      </view>

      <button class="primary-button" :loading="saving" @click="handleSave">保存设置</button>
      <text v-if="statusText" class="settings-card__status">{{ statusText }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.settings-card {
  padding: 28rpx;
}

.settings-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.settings-card__desc,
.settings-card__status {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
}

.setting-row--disabled {
  opacity: 0.52;
}

.setting-row__label {
  font-size: 26rpx;
  color: $color-text-primary;
}

.setting-time {
  margin: 24rpx 0;
}

.settings-input {
  width: 100%;
  margin-top: 12rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(47, 95, 152, 0.12);
  color: $color-text-primary;
  box-sizing: border-box;
}
</style>
