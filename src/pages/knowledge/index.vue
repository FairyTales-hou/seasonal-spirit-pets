<script setup lang="ts">
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { knowledgeCards } = useHome()
</script>

<template>
  <view class="container knowledge">
    <view v-for="item in knowledgeCards" :key="item.title" class="card knowledge__card section-gap">
      <SectionTitle :title="item.title" />
      <text class="knowledge__content">{{ item.content }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.knowledge__card {
  padding: 28rpx;
}

.knowledge__content {
  display: block;
  font-size: 26rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}
</style>
