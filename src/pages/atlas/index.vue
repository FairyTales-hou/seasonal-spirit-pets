<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'
import { SEASON_LABELS } from '@/constants/solar-terms'
import type { PetProfile } from '@/types/pet'

const { pets, homeData, isPetUnlocked } = useHome()

const groups = ['spring', 'summer', 'autumn', 'winter'] as const
const copy = {
  title: '图鉴',
  subtitle: '把一年四季的小灵宠慢慢收集起来',
  progressEyebrow: '图鉴进度',
  unlocked: '已解锁',
  currentTerm: '当前节气',
  seasonSuffix: '之灵宠',
  locked: '未解锁',
}

const isUnlockedPet = (pet: PetProfile) => isPetUnlocked(pet.id)
const atlasUnlockedPets = computed(() => pets.filter((pet) => isUnlockedPet(pet)))

function openPetDetail(pet: PetProfile) {
  uni.navigateTo({ url: `${ROUTES.petDetail}?petId=${pet.id}` })
}
</script>

<template>
  <view class="container">
    <AppHeader :title="copy.title" :subtitle="copy.subtitle" />

    <view class="card progress section-gap">
      <text class="progress__eyebrow">{{ copy.progressEyebrow }}</text>
      <text class="progress__title">{{ copy.unlocked }} {{ atlasUnlockedPets.length }} / {{ pets.length }}</text>
      <text class="progress__desc">{{ copy.currentTerm }} · {{ homeData.solarTerm }}</text>
    </view>

    <view v-for="season in groups" :key="season" class="section-gap">
      <SectionTitle :title="`${SEASON_LABELS[season]}${copy.seasonSuffix}`" />
      <view class="atlas-grid">
        <view
          v-for="pet in pets.filter((item) => item.season === season)"
          :key="pet.id"
          class="atlas-card card"
          :class="{ 'atlas-card--active': pet.solarTerm === homeData.solarTerm, 'atlas-card--locked': !isUnlockedPet(pet) }"
          @click="openPetDetail(pet)"
        >
          <view class="atlas-card__image-wrap">
            <image class="atlas-card__image" :src="pet.image" mode="aspectFill" />
            <view v-if="!isUnlockedPet(pet)" class="atlas-card__image-mask">{{ copy.locked }}</view>
          </view>
          <text class="atlas-card__name">{{ isUnlockedPet(pet) ? pet.name : copy.locked }}</text>
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

.progress__eyebrow {
  display: block;
  margin-bottom: 10rpx;
  font-size: 20rpx;
  color: $color-primary;
  letter-spacing: 1.4rpx;
}

.progress__title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
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
  min-height: 220rpx;
  padding: 28rpx 22rpx;
}

.atlas-card--active {
  border-color: rgba(132, 184, 255, 0.52);
  box-shadow:
    0 24rpx 60rpx rgba(57, 109, 179, 0.18),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.78);
}

.atlas-card--locked {
  opacity: 0.72;
}

.atlas-card__image-wrap {
  position: relative;
  width: 128rpx;
  height: 128rpx;
  border-radius: 28rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.66);
  background: rgba(255, 255, 255, 0.42);
}

.atlas-card__image {
  width: 100%;
  height: 100%;
}

.atlas-card__image-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #fff;
  background: rgba(40, 46, 58, 0.48);
  backdrop-filter: blur(2rpx);
}

.atlas-card__name {
  font-size: 28rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.atlas-card__term {
  font-size: 22rpx;
  line-height: 1.5;
  color: $color-text-secondary;
}
</style>
