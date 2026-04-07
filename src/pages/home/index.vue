<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import PetHeroCard from '@/components/business/PetHeroCard.vue'
import TipSummaryCard from '@/components/business/TipSummaryCard.vue'
import GrowthPanel from '@/components/business/GrowthPanel.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'

const { homeData, currentPet } = useHome()

function goTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="container">
    <AppHeader :title="`今日节气 · ${homeData.solarTerm}`" :subtitle="homeData.dateText" />

    <view class="topline section-gap">
      <text class="pill">{{ homeData.solarTermTagline }}</text>
      <text class="topline__text">距离下一个节气还有 {{ homeData.daysUntilNextTerm }} 天</text>
    </view>

    <view class="section-gap" @click="goTo(ROUTES.petDetail)">
      <PetHeroCard :pet="currentPet" :bubble="homeData.petBubble" :weather-summary="homeData.weatherSummary" />
    </view>

    <view class="section-gap">
      <SectionTitle title="今日建议" caption="一眼能扫完的轻提醒" />
      <view class="tips-grid">
        <view v-for="item in homeData.suggestions" :key="item.title" @click="goTo(ROUTES.tipsDetail)">
          <TipSummaryCard :item="item" />
        </view>
      </view>
    </view>

    <view class="section-gap">
      <SectionTitle title="现在适合做什么" />
      <view class="action-grid">
        <button class="action-card card" @click="goTo(ROUTES.interaction)">
          <text class="action-card__title">去陪陪它</text>
          <text class="action-card__desc">完成今天的一次轻互动</text>
        </button>
        <button class="action-card card" @click="goTo(ROUTES.knowledge)">
          <text class="action-card__title">看看节气小知识</text>
          <text class="action-card__desc">滑几张轻量知识卡</text>
        </button>
      </view>
    </view>

    <view class="section-gap">
      <GrowthPanel
        :interaction-done="homeData.interactionDone"
        :streak-days="homeData.streakDays"
        :growth-value="homeData.growthValue"
        :next-level-growth="homeData.nextLevelGrowth"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.topline__text {
  font-size: 22rpx;
  color: $color-text-secondary;
}

.tips-grid,
.action-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-card {
  width: 100%;
  padding: 24rpx;
  text-align: left;
}

.action-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.action-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $color-text-secondary;
}
</style>
