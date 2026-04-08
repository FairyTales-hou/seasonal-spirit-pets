<script setup lang="ts">
defineProps<{
  title: string
  caption?: string
}>()
</script>

<template>
  <view class="section-title">
    <view class="section-title__main">
      <text class="section-title__glow" />
      <text class="section-title__text">{{ title }}</text>
    </view>
    <text v-if="caption" class="section-title__caption">{{ caption }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.section-title__main {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.section-title__glow {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, #98c8ff 45%, #82aef0 100%);
  box-shadow: 0 0 24rpx rgba(130, 174, 240, 0.45);
}

.section-title__text {
  font-size: 32rpx;
  font-weight: 700;
  color: $color-text-primary;
  letter-spacing: -0.4rpx;
}

.section-title__caption {
  font-size: 22rpx;
  white-space: nowrap;
  color: $color-text-secondary;
}
</style>
