<script setup lang="ts">
const labels = {
  today: '今日状态',
  done: '今天已完成互动',
  waiting: '今天还没有互动',
  streakSuffix: '天连续陪伴',
  growth: '成长值',
}

defineProps<{
  interactionDone: boolean
  streakDays: number
  growthValue: number
  nextLevelGrowth: number
}>()
</script>

<template>
  <view class="growth card">
    <view class="growth__row">
      <view class="growth__main">
        <text class="growth__label">{{ labels.today }}</text>
        <text class="growth__value">{{ interactionDone ? labels.done : labels.waiting }}</text>
      </view>
      <text class="pill">{{ streakDays }} {{ labels.streakSuffix }}</text>
    </view>

    <view class="growth__progress">
      <view class="growth__bar">
        <view class="growth__bar-fill" :style="{ width: `${Math.min((growthValue / nextLevelGrowth) * 100, 100)}%` }" />
      </view>
      <text class="growth__hint">{{ labels.growth }} {{ growthValue }} / {{ nextLevelGrowth }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.growth {
  padding: 24rpx;
}

.growth__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.growth__main {
  flex: 1;
}

.growth__label {
  display: block;
  font-size: 24rpx;
  letter-spacing: 1rpx;
  color: $color-text-secondary;
}

.growth__value {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.55;
  color: $color-text-primary;
}

.growth__progress {
  margin-top: 20rpx;
}

.growth__bar {
  overflow: hidden;
  width: 100%;
  height: 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.42);
  border: 1rpx solid rgba(255, 255, 255, 0.62);
}

.growth__bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0) 40%),
    linear-gradient(90deg, #8ac1ff 0%, #6b96ea 50%, #b9d6ff 100%);
  box-shadow: 0 8rpx 18rpx rgba(88, 132, 205, 0.3);
}

.growth__hint {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $color-text-secondary;
}
</style>
