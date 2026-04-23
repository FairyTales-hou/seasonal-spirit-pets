<script setup lang="ts">
import type { AlmanacSummary } from '@/types/home'

defineProps<{
  almanac: AlmanacSummary
}>()
</script>

<template>
  <view class="card almanac-card">
    <view class="almanac-card__header">
      <text class="almanac-card__title">今日黄历</text>
      <text class="almanac-card__lunar">{{ almanac.lunarText }}</text>
    </view>

    <view class="almanac-card__body">
      <view class="almanac-card__group">
        <text class="almanac-card__badge almanac-card__badge--good">宜</text>
        <view class="almanac-card__tags">
          <text v-for="item in almanac.suitableActivities" :key="`yi-${item}`" class="almanac-card__tag">
            {{ item }}
          </text>
        </view>
      </view>

      <view class="almanac-card__group">
        <text class="almanac-card__badge almanac-card__badge--avoid">忌</text>
        <view class="almanac-card__tags">
          <text v-for="item in almanac.unsuitableActivities" :key="`ji-${item}`" class="almanac-card__tag">
            {{ item }}
          </text>
        </view>
      </view>
    </view>

    <text class="almanac-card__hint">{{ almanac.seasonalHint }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.almanac-card {
  padding: 28rpx;
}

.almanac-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
}

.almanac-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.almanac-card__lunar {
  font-size: 22rpx;
  color: $color-text-secondary;
}

.almanac-card__body {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 20rpx;
}

.almanac-card__group {
  display: flex;
  gap: 18rpx;
  // align-items: flex-start;
  align-items: center;
}

.almanac-card__badge {
  min-width: 40rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.almanac-card__badge--good {
  color: $color-primary;
}

.almanac-card__badge--avoid {
  color: $color-secondary;
}

.almanac-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.almanac-card__tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.64);
  font-size: 22rpx;
  color: $color-text-primary;
}

.almanac-card__hint {
  display: block;
  margin-top: 22rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}
</style>
