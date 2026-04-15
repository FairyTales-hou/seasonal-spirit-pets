<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import { useHome } from '@/composables/useHome'

const { mineActions, homeData } = useHome()

const copy = {
  title: '我的',
  subtitle: '把今天的陪伴、收藏和设置放在这里',
  eyebrow: '个人空间',
  namePrefix: '正在和',
  nameSuffix: '一起生活',
  descPrefix: '已连续陪伴',
  descSuffix: '天，今天也适合慢一点照顾自己。',
}

function handleAction(route: string) {
  uni.navigateTo({ url: route })
}
</script>

<template>
  <view class="container">
    <AppHeader :title="copy.title" :subtitle="copy.subtitle" />

    <view class="profile card section-gap">
      <text class="profile__eyebrow">{{ copy.eyebrow }}</text>
      <text class="profile__name">{{ copy.namePrefix }} {{ homeData.solarTerm }} {{ copy.nameSuffix }}</text>
      <text class="profile__desc">{{ copy.descPrefix }} {{ homeData.streakDays }} {{ copy.descSuffix }}</text>
    </view>

    <view class="actions section-gap">
      <view
        v-for="item in mineActions"
        :key="item.title"
        class="actions__item card"
        @click="handleAction(item.route)"
      >
        <view>
          <text class="actions__text">{{ item.title }}</text>
          <text class="actions__desc">{{ item.description }}</text>
        </view>
        <text class="actions__arrow">&gt;</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.profile {
  padding: 28rpx;
}

.profile__eyebrow {
  display: block;
  margin-bottom: 12rpx;
  font-size: 20rpx;
  color: $color-primary;
  letter-spacing: 1.4rpx;
}

.profile__name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.35;
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
  padding: 28rpx 24rpx;
}


.actions__text {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
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
  font-size: 32rpx;
  color: $color-primary;
}
</style>
