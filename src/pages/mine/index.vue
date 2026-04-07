<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'

const { mineActions, homeData } = useHome()

function handleAction(title: string, available: boolean) {
  if (!available) {
    return
  }

  if (title === '我的收藏') {
    uni.navigateTo({ url: ROUTES.favorites })
    return
  }

  if (title === '连续陪伴记录') {
    uni.navigateTo({ url: ROUTES.records })
    return
  }

  if (title === '关于节气灵宠') {
    uni.navigateTo({ url: ROUTES.about })
  }
}
</script>

<template>
  <view class="container">
    <AppHeader title="我的" subtitle="把今天的陪伴、收藏和设置放在这里" />

    <view class="profile card section-gap">
      <text class="profile__name">和 {{ homeData.solarTerm }} 灵宠一起生活中</text>
      <text class="profile__desc">已连续陪伴 {{ homeData.streakDays }} 天，今天也适合慢一点照顾自己。</text>
    </view>

    <view class="actions section-gap">
      <view
        v-for="item in mineActions"
        :key="item.title"
        class="actions__item card"
        :class="{ 'actions__item--disabled': !item.available }"
        @click="handleAction(item.title, item.available)"
      >
        <view>
          <text class="actions__text">{{ item.title }}</text>
          <text class="actions__desc">{{ item.description }}</text>
        </view>
        <text class="actions__arrow">›</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.profile {
  padding: 28rpx;
}

.profile__name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.profile__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.actions__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 24rpx;
}

.actions__item--disabled {
  opacity: 0.68;
}

.actions__text {
  display: block;
  font-size: 28rpx;
  color: $color-text-primary;
}

.actions__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: $color-text-secondary;
}

.actions__arrow {
  font-size: 36rpx;
  color: $color-text-secondary;
}
</style>
