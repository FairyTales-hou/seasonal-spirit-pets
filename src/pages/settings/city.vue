<script setup lang="ts">
import { ref } from 'vue'
import { getCity } from '@/utils/location'
import { useHome } from '@/composables/useHome'

const { homeData, saveCity, refreshWeatherByCity } = useHome()
const cityInput = ref(homeData.value.cityName)
const locating = ref(false)
const saving = ref(false)
const statusText = ref('')

async function handleUseCurrentLocation() {
  locating.value = true
  statusText.value = ''

  try {
    const query = await getCity(homeData.value.cityName)
    cityInput.value = query.fallbackCityName || query.location
    await saveCity(cityInput.value)
    const refreshed = await refreshWeatherByCity()
    statusText.value = refreshed ? '已更新当前城市与天气。' : '已保存当前城市，天气稍后刷新。'
  } catch (error) {
    statusText.value = '定位失败，请手动输入城市。'
  } finally {
    locating.value = false
  }
}

async function handleSave() {
  const nextCity = cityInput.value.trim()
  if (!nextCity) {
    statusText.value = '请输入城市名称。'
    return
  }

  saving.value = true
  statusText.value = ''

  try {
    await saveCity(nextCity)
    const refreshed = await refreshWeatherByCity()
    statusText.value = refreshed ? '城市已保存，天气已刷新。' : '城市已保存，天气稍后刷新。'
  } catch (error) {
    statusText.value = '城市保存失败，请稍后再试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="container">
    <view class="card section-gap settings-card">
      <text class="settings-card__label">当前城市</text>
      <text class="settings-card__value">{{ homeData.cityName }}</text>
      <text class="settings-card__desc">首页天气将优先使用这里保存的城市。</text>
    </view>

    <view class="card section-gap settings-card">
      <text class="settings-card__label">手动修改</text>
      <input v-model="cityInput" class="settings-input" placeholder="请输入城市名" />
      <button class="primary-button" :loading="saving" @click="handleSave">保存城市</button>
      <button class="secondary-button" :loading="locating" @click="handleUseCurrentLocation">使用当前位置</button>
      <text v-if="statusText" class="settings-card__status">{{ statusText }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.settings-card {
  padding: 28rpx;
}

.settings-card__label {
  display: block;
  font-size: 24rpx;
  color: $color-primary;
}

.settings-card__value {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
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

.settings-input {
  width: 100%;
  margin: 20rpx 0;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(47, 95, 152, 0.12);
  color: $color-text-primary;
  box-sizing: border-box;
}

.secondary-button {
  margin-top: 16rpx;
}
</style>
