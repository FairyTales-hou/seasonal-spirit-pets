<script setup lang="ts">
const eyebrowText = '节气灵宠'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <view class="header">
    <view class="header__eyebrow">
      <text class="header__eyebrow-dot" />
      <text class="header__eyebrow-text">{{ eyebrowText }}</text>
    </view>
    <text class="title">{{ title }}</text>
    <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.header__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  width: fit-content;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.48);
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.78);
}

.header__eyebrow-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #82bcff 0%, #ffd9bd 100%);
}

.header__eyebrow-text {
  font-size: 20rpx;
  color: $color-primary;
  letter-spacing: 1.6rpx;
}

.title {
  font-size: 50rpx;
  font-weight: 700;
  line-height: 1.14;
  letter-spacing: -0.8rpx;
  color: $color-text-primary;
  text-shadow: 0 10rpx 30rpx rgba(255, 255, 255, 0.35);
}

.subtitle {
  max-width: 88%;
  font-size: 24rpx;
  line-height: 1.65;
  color: $color-text-secondary;
}
</style>
