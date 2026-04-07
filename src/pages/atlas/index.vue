<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'
import { SEASON_LABELS } from '@/constants/solar-terms'
import type { PetProfile } from '@/types/pet'

const { pets, unlockedPets, homeData } = useHome()

const groups = ['spring', 'summer', 'autumn', 'winter'] as const

function openPetDetail(pet: PetProfile) {
  uni.navigateTo({ url: `${ROUTES.petDetail}?petId=${pet.id}` })
}
</script>

<template>
  <view class="container">
    <AppHeader title="节气图鉴" subtitle="把一年四季的小灵宠慢慢收集起来" />

    <view class="card progress section-gap">
      <text class="progress__title">已解锁 {{ unlockedPets.length }} / {{ pets.length }}</text>
      <text class="progress__desc">当前节气 · {{ homeData.solarTerm }}</text>
    </view>

    <view v-for="season in groups" :key="season" class="section-gap">
      <SectionTitle :title="`${SEASON_LABELS[season]}之灵宠`" />
      <view class="atlas-grid">
        <view
          v-for="pet in pets.filter((item) => item.season === season)"
          :key="pet.id"
          class="atlas-card card"
          :class="{ 'atlas-card--active': pet.solarTerm === homeData.solarTerm, 'atlas-card--locked': !pet.unlocked }"
          @click="openPetDetail(pet)"
        >
          <text class="atlas-card__emoji">{{ pet.unlocked ? '🐾' : '🌫️' }}</text>
          <text class="atlas-card__name">{{ pet.unlocked ? pet.name : '未解锁' }}</text>
          <text class="atlas-card__term">{{ pet.solarTerm }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.progress {
  padding: 28rpx;
}

.progress__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.progress__desc {
  display: block;
  margin-top: 10rpx;
  color: $color-text-secondary;
  font-size: 24rpx;
}

.atlas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.atlas-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 28rpx 20rpx;
}

.atlas-card--active {
  border-color: rgba(190, 143, 99, 0.45);
}

.atlas-card--locked {
  opacity: 0.72;
}

.atlas-card__emoji {
  font-size: 60rpx;
}

.atlas-card__name {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.atlas-card__term {
  font-size: 22rpx;
  color: $color-text-secondary;
}
</style>
