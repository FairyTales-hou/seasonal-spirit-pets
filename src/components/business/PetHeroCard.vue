<script setup lang="ts">
import type { PetProfile } from '@/types/pet'

defineProps<{
  pet: PetProfile
  bubble: string
  weatherSummary: string
}>()
</script>

<template>
  <view class="hero card">
    <view class="hero__meta">
      <text class="pill">{{ weatherSummary }}</text>
      <text class="hero__name">{{ pet.name }} · {{ pet.solarTerm }}</text>
    </view>
    <view class="hero__art">
      <view class="hero__orb">
        <view class="hero__orb-ring hero__orb-ring--outer" />
        <view class="hero__orb-ring hero__orb-ring--inner" />
        <image class="hero__image" :src="pet.image" mode="aspectFill" />
      </view>
    </view>
    <view class="hero__bubble">{{ bubble }}</view>
    <view class="hero__tags">
      <text v-for="item in pet.personality" :key="item" class="hero__tag">{{ item }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.hero {
  padding: 28rpx;
}

.hero__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.hero__name {
  font-size: 24rpx;
  font-weight: 600;
  color: $color-text-secondary;
}

.hero__art {
  display: flex;
  justify-content: center;
  padding: 42rpx 0 28rpx;
}

.hero__orb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.36) 22%, rgba(255, 255, 255, 0) 48%),
    radial-gradient(circle at 66% 72%, rgba(173, 212, 255, 0.54) 0%, rgba(173, 212, 255, 0.04) 42%, rgba(173, 212, 255, 0) 65%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(225, 239, 255, 0.4) 100%);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.88),
    0 22rpx 52rpx rgba(72, 121, 176, 0.18);
}

.hero__orb-ring {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(255, 255, 255, 0.58);
}

.hero__orb-ring--outer {
  inset: 18rpx;
}

.hero__orb-ring--inner {
  inset: 48rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 72%);
}

.hero__image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.hero__bubble {
  position: relative;
  padding: 24rpx;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.36);
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  color: $color-text-primary;
  font-size: 28rpx;
  line-height: 1.65;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.hero__tag {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.42);
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  color: $color-secondary;
  font-size: 22rpx;
}
</style>
