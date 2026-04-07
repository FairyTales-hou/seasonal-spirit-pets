<script setup lang="ts">
defineProps<{
  title: string
  caption?: string
}>()
</script>

<template>
  <view class="section-title">
    <text class="section-title__text">{{ title }}</text>
    <text v-if="caption" class="section-title__caption">{{ caption }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title__text {
  font-size: 30rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.section-title__caption {
  font-size: 22rpx;
  color: $color-text-secondary;
}
</style>
