<script setup lang="ts">
import type { SuggestionSummary } from '@/types/home'

defineProps<{
  item: SuggestionSummary
}>()
</script>

<template>
  <view class="tip card">
    <view class="tip__icon">{{ item.type === 'wear' ? '◌' : item.type === 'food' ? '◍' : '◎' }}</view>
    <text class="tip__title">{{ item.title }}</text>
    <text class="tip__content">{{ item.content }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.tip {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 24rpx;
}

.tip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.44);
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  color: $color-primary;
  font-size: 24rpx;
  font-weight: 700;
}

.tip__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $color-primary-deep;
}

.tip__content {
  display: block;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}
</style>
