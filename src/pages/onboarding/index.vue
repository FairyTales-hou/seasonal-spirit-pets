<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ROUTES } from '@/constants/routes'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const redirected = ref(false)

const copy = {
  badge: '节气灵宠',
  title: '陪你把一年四季慢慢过完',
  desc: '在每一个节气里，认识一只属于当下的小灵宠。看天气、看节气、看它怎么慢慢长大。',
  cardTitle: '今天的节气入口已经准备好了',
  cardText: '首期先用静态城市和天气演示，后续再继续接入真实定位、天气和提醒能力。',
  primary: '开始今天的节气旅程',
  secondary: '先看看再说',
}

function skipIfOnboarded() {
  if (!appStore.hasOnboarded || redirected.value) {
    return
  }

  redirected.value = true
  uni.switchTab({ url: ROUTES.home })
}

function enterApp() {
  appStore.completeOnboarding()
  uni.switchTab({ url: ROUTES.home })
}

onShow(skipIfOnboarded)
skipIfOnboarded()
</script>

<template>
  <view class="container onboarding">
    <view class="onboarding__hero">
      <text class="onboarding__badge">{{ copy.badge }}</text>
      <text class="onboarding__title">{{ copy.title }}</text>
      <text class="onboarding__desc">{{ copy.desc }}</text>
    </view>

    <view class="onboarding__card card">
      <text class="onboarding__card-title">{{ copy.cardTitle }}</text>
      <text class="onboarding__card-text">{{ copy.cardText }}</text>
      <view class="onboarding__actions">
        <button class="primary-button" @click="enterApp">{{ copy.primary }}</button>
        <button class="secondary-button" @click="enterApp">{{ copy.secondary }}</button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.onboarding {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32rpx;
  padding-top: 80rpx;
  padding-bottom: 48rpx;
}

.onboarding__hero {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.onboarding__badge {
  display: inline-flex;
  width: fit-content;
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  background: $color-bg-accent;
  color: $color-primary;
  font-size: 22rpx;
}

.onboarding__title {
  font-size: 56rpx;
  font-weight: 600;
  line-height: 1.3;
  color: $color-text-primary;
}

.onboarding__desc {
  font-size: 28rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}

.onboarding__card {
  padding: 32rpx;
}

.onboarding__card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.onboarding__card-text {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}

.onboarding__actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 28rpx;
}
</style>
