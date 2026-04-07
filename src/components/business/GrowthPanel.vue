<script setup lang="ts">
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
      <view>
        <text class="growth__label">今日互动</text>
        <text class="growth__value">{{ interactionDone ? '今天已经陪过它啦' : '今天还没有和它打招呼' }}</text>
      </view>
      <text class="pill">连续陪伴 {{ streakDays }} 天</text>
    </view>

    <view class="growth__progress">
      <view class="growth__bar">
        <view class="growth__bar-fill" :style="{ width: `${Math.min((growthValue / nextLevelGrowth) * 100, 100)}%` }" />
      </view>
      <text class="growth__hint">成长值 {{ growthValue }} / {{ nextLevelGrowth }}</text>
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

.growth__label {
  display: block;
  font-size: 24rpx;
  color: $color-text-secondary;
}

.growth__value {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  color: $color-text-primary;
}

.growth__progress {
  margin-top: 20rpx;
}

.growth__bar {
  overflow: hidden;
  width: 100%;
  height: 18rpx;
  border-radius: 999rpx;
  background: #efe7d8;
}

.growth__bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #cda36b 0%, #6c845f 100%);
}

.growth__hint {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $color-text-secondary;
}
</style>
