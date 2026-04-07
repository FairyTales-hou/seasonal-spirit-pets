<script setup lang="ts">
import type { SuggestionSummary } from '@/types/home'

defineProps<{
  item: SuggestionSummary
}>()
</script>

<template>
  <view class="tip card">
    <text class="tip__title">{{ item.title }}</text>
    <text class="tip__content">{{ item.content }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.tip {
  padding: 24rpx;
}

.tip__title {
  display: block;
  margin-bottom: 10rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: $color-primary-deep;
}

.tip__content {
  display: block;
  font-size: 24rpx;
  line-height: 1.6;
  color: $color-text-secondary;
}
</style>
