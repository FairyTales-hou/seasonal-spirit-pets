<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <view class="header">
    <text class="title">{{ title }}</text>
    <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.subtitle {
  font-size: 24rpx;
  color: $color-text-secondary;
}
</style>
