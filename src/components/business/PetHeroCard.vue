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
        <text class="hero__emoji">🐾</text>
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
  color: $color-text-secondary;
}

.hero__art {
  display: flex;
  justify-content: center;
  padding: 32rpx 0 24rpx;
}

.hero__orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: radial-gradient(circle at top, #fef6e6 0%, #e8f1dc 100%);
}

.hero__emoji {
  font-size: 120rpx;
}

.hero__bubble {
  padding: 24rpx;
  border-radius: $radius-lg;
  background: #fffdf8;
  color: $color-text-primary;
  font-size: 28rpx;
  line-height: 1.6;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.hero__tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: $color-bg-soft;
  color: $color-secondary;
  font-size: 22rpx;
}
</style>
