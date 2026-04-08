<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import PetHeroCard from '@/components/business/PetHeroCard.vue'
import TipSummaryCard from '@/components/business/TipSummaryCard.vue'
import GrowthPanel from '@/components/business/GrowthPanel.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'

const { homeData, currentPet } = useHome()

const copy = {
  headerPrefix: '今日',
  nextTerm: '距离下一个节气还有',
  days: '天',
  picksTitle: '今日建议',
  picksCaption: '一眼能扫完的轻提醒',
  nextTitle: '现在适合做什么',
  ritualBadge: '每日陪伴',
  ritualTitle: '去陪陪它',
  ritualDesc: '完成今天的一次轻互动',
  notesBadge: '节气小记',
  notesTitle: '看看节气小知识',
  notesDesc: '滑几张轻量知识卡',
}

function goTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="container">
    <view class="floating floating--left" />
    <view class="floating floating--right" />

    <AppHeader :title="`${copy.headerPrefix} · ${homeData.solarTerm}`" :subtitle="homeData.dateText" />

    <view class="topline card section-gap">
      <text class="pill">{{ homeData.solarTermTagline }}</text>
      <text class="topline__text">{{ copy.nextTerm }} {{ homeData.daysUntilNextTerm }} {{ copy.days }}</text>
    </view>

    <view class="section-gap" @click="goTo(ROUTES.petDetail)">
      <PetHeroCard :pet="currentPet" :bubble="homeData.petBubble" :weather-summary="homeData.weatherSummary" />
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.picksTitle" :caption="copy.picksCaption" />
      <view class="tips-grid">
        <view v-for="item in homeData.suggestions" :key="item.title" @click="goTo(ROUTES.tipsDetail)">
          <TipSummaryCard :item="item" />
        </view>
      </view>
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.nextTitle" />
      <view class="action-grid">
        <button class="action-card card" @click="goTo(ROUTES.interaction)">
          <text class="action-card__badge">{{ copy.ritualBadge }}</text>
          <text class="action-card__title">{{ copy.ritualTitle }}</text>
          <text class="action-card__desc">{{ copy.ritualDesc }}</text>
        </button>
        <button class="action-card card" @click="goTo(ROUTES.knowledge)">
          <text class="action-card__badge">{{ copy.notesBadge }}</text>
          <text class="action-card__title">{{ copy.notesTitle }}</text>
          <text class="action-card__desc">{{ copy.notesDesc }}</text>
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
  padding: 22rpx 24rpx;
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
  padding: 28rpx 24rpx;
  text-align: left;
}

.action-card__badge {
  display: inline-flex;
  margin-bottom: 16rpx;
  font-size: 20rpx;
  color: $color-primary;
  letter-spacing: 1.2rpx;
}

.action-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.action-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: $color-text-secondary;
}

.floating {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(14rpx);
  opacity: 0.85;
  pointer-events: none;
}

.floating--left {
  top: 160rpx;
  left: -36rpx;
  width: 120rpx;
  height: 120rpx;
  background: radial-gradient(circle, rgba(255, 219, 188, 0.88) 0%, rgba(255, 219, 188, 0) 72%);
}

.floating--right {
  top: 440rpx;
  right: -30rpx;
  width: 150rpx;
  height: 150rpx;
  background: radial-gradient(circle, rgba(136, 197, 255, 0.8) 0%, rgba(136, 197, 255, 0) 74%);
}
</style>
