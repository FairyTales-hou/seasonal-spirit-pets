<script setup lang="ts">
import { useAppStore } from '@/store/app'
import { ROUTES } from '@/constants/routes'

const appStore = useAppStore()

function enterApp() {
  appStore.completeOnboarding()
  uni.switchTab({ url: ROUTES.home })
}
</script>

<template>
  <view class="container onboarding">
    <view class="onboarding__hero">
      <text class="onboarding__badge">节气灵宠</text>
      <text class="onboarding__title">陪你过节气的东方生活小宠物</text>
      <text class="onboarding__desc">
        在每一个时令里，认识一只属于当下的小灵宠。看看今天适合怎么穿、怎么吃、怎么慢慢照顾自己。
      </text>
    </view>

    <view class="onboarding__card card">
      <text class="onboarding__card-title">今天的节气入口已经准备好了</text>
      <text class="onboarding__card-text">首期先用静态城市与天气演示，下一步再接真实定位与天气能力。</text>
      <view class="onboarding__actions">
        <button class="primary-button" @click="enterApp">开启今日节气</button>
        <button class="secondary-button" @click="enterApp">先随便看看</button>
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
