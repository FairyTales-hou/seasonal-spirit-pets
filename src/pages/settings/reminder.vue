<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useHome } from '@/composables/useHome'
import {
  canRequestReminderPermission,
  pushReminderPreview,
  requestReminderPermission,
} from '@/services/reminder'
import type { ReminderSubscriptionChannel, ReminderSubscriptionStatus } from '@/types/home'

const { homeData, saveReminderSettings } = useHome()
const saving = ref(false)
const authorizing = ref(false)
const testingPush = ref(false)
const statusText = ref('')
const hasLocalEdits = ref(false)
const isSyncingForm = ref(false)

const form = reactive({
  reminderEnabled: homeData.value.reminderEnabled,
  dailyReminderEnabled: homeData.value.dailyReminderEnabled,
  solarTermReminderEnabled: homeData.value.solarTermReminderEnabled,
  reminderTime: homeData.value.reminderTime,
  reminderSubscriptionStatus: homeData.value.reminderSubscriptionStatus,
  reminderSubscriptionChannel: homeData.value.reminderSubscriptionChannel,
  reminderSubscriptionUpdatedAt: homeData.value.reminderSubscriptionUpdatedAt,
})

function syncFormFromHomeData() {
  isSyncingForm.value = true
  form.reminderEnabled = homeData.value.reminderEnabled
  form.dailyReminderEnabled = homeData.value.dailyReminderEnabled
  form.solarTermReminderEnabled = homeData.value.solarTermReminderEnabled
  form.reminderTime = homeData.value.reminderTime
  form.reminderSubscriptionStatus = homeData.value.reminderSubscriptionStatus
  form.reminderSubscriptionChannel = homeData.value.reminderSubscriptionChannel
  form.reminderSubscriptionUpdatedAt = homeData.value.reminderSubscriptionUpdatedAt
  isSyncingForm.value = false
}

watch(
  () => [
    homeData.value.reminderEnabled,
    homeData.value.dailyReminderEnabled,
    homeData.value.solarTermReminderEnabled,
    homeData.value.reminderTime,
    homeData.value.reminderSubscriptionStatus,
    homeData.value.reminderSubscriptionChannel,
    homeData.value.reminderSubscriptionUpdatedAt,
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
const canAuthorize = computed(() => canRequestReminderPermission())
const canTestPush = computed(() => form.reminderEnabled && form.reminderSubscriptionStatus === 'granted')

const subscriptionStatusText = computed(() => {
  switch (form.reminderSubscriptionStatus) {
    case 'granted':
      return '已授权订阅'
    case 'denied':
      return '已拒绝订阅'
    case 'unsupported':
      return '当前平台不支持'
    default:
      return '未授权'
  }
})

const subscriptionChannelText = computed(() => {
  switch (form.reminderSubscriptionChannel) {
    case 'wechat-subscribe':
      return '微信订阅消息'
    case 'web-notification':
      return '浏览器通知'
    default:
      return '未识别渠道'
  }
})

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

async function handleAuthorize() {
  authorizing.value = true
  statusText.value = ''

  try {
    const result = await requestReminderPermission()
    form.reminderSubscriptionStatus = result.status
    form.reminderSubscriptionChannel = result.channel
    form.reminderSubscriptionUpdatedAt = result.updatedAt
    statusText.value = result.message
  } finally {
    authorizing.value = false
  }
}

function buildReminderPayload(overrides?: {
  reminderSubscriptionStatus?: ReminderSubscriptionStatus
  reminderSubscriptionChannel?: ReminderSubscriptionChannel
  reminderSubscriptionUpdatedAt?: string
}) {
  return {
    reminderEnabled: form.reminderEnabled,
    dailyReminderEnabled: form.dailyReminderEnabled,
    solarTermReminderEnabled: form.solarTermReminderEnabled,
    reminderTime: form.reminderTime,
    reminderSubscriptionStatus: overrides?.reminderSubscriptionStatus ?? form.reminderSubscriptionStatus,
    reminderSubscriptionChannel: overrides?.reminderSubscriptionChannel ?? form.reminderSubscriptionChannel,
    reminderSubscriptionUpdatedAt: overrides?.reminderSubscriptionUpdatedAt ?? form.reminderSubscriptionUpdatedAt,
  }
}

async function handleSave() {
  saving.value = true
  statusText.value = ''

  try {
    await saveReminderSettings(buildReminderPayload())
    hasLocalEdits.value = false
    statusText.value = '提醒设置已保存。'
  } catch (error) {
    console.warn('[reminder] save settings failed', error)
    statusText.value = '提醒设置保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

async function handleTestPush() {
  testingPush.value = true
  statusText.value = ''

  try {
    await saveReminderSettings(buildReminderPayload())
    const result = await pushReminderPreview({
      userId: '',
      cityName: homeData.value.cityName,
      reminderTime: form.reminderTime,
      dailyReminderEnabled: form.dailyReminderEnabled,
      solarTermReminderEnabled: form.solarTermReminderEnabled,
    })
    statusText.value = result.message
  } catch (error) {
    console.warn('[reminder] test push failed', error)
    statusText.value = '测试提醒失败，请稍后重试。'
  } finally {
    testingPush.value = false
  }
}
</script>

<template>
  <view class="container">
    <view class="card section-gap settings-card">
      <text class="settings-card__title">提醒设置</text>
      <text class="settings-card__desc">已支持提醒订阅授权与测试推送，保存后会同步到云端。</text>

      <view class="status-panel">
        <text class="status-panel__title">订阅状态：{{ subscriptionStatusText }}</text>
        <text class="status-panel__meta">渠道：{{ subscriptionChannelText }}</text>
        <text v-if="form.reminderSubscriptionUpdatedAt" class="status-panel__meta">
          更新时间：{{ form.reminderSubscriptionUpdatedAt }}
        </text>
      </view>

      <view class="button-row">
        <button
          class="glass-button"
          size="mini"
          :disabled="authorizing || !canAuthorize"
          :loading="authorizing"
          @click="handleAuthorize"
        >
          {{ canAuthorize ? '授权提醒' : '当前平台不支持授权' }}
        </button>
        <button class="glass-button" size="mini" :disabled="testingPush || !canTestPush" :loading="testingPush" @click="handleTestPush">
          发送测试提醒
        </button>
      </view>

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

.status-panel {
  margin-top: 22rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  border: 1rpx solid rgba(47, 95, 152, 0.16);
  background: rgba(255, 255, 255, 0.62);
}

.status-panel__title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.status-panel__meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $color-text-secondary;
}

.button-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 20rpx;
}

.glass-button {
  border: 1rpx solid rgba(47, 95, 152, 0.2);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.74);
  color: $color-text-primary;
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
