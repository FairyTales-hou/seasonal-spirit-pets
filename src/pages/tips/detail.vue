<script setup lang="ts">
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { detailedSuggestions } = useHome()
</script>

<template>
  <view class="container">
    <view v-for="section in detailedSuggestions" :key="section.title" class="card detail section-gap">
      <SectionTitle :title="section.title" />
      <text class="detail__content">{{ section.content }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.detail {
  padding: 28rpx;
}

.detail__content {
  display: block;
  font-size: 26rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}
</style>
