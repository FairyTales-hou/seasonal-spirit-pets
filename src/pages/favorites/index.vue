<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'
import type { PetProfile } from '@/types/pet'

const { favoritePets } = useHome()

function openPetDetail(pet: PetProfile) {
  uni.navigateTo({ url: `${ROUTES.petDetail}?petId=${pet.id}` })
}
</script>

<template>
  <view class="container">
    <AppHeader title="我的收藏" subtitle="把你想反复看看的一点季节陪伴放在这里" />

    <view v-if="favoritePets.length" class="section-gap">
      <SectionTitle :title="`已收藏 ${favoritePets.length} 只灵宠`" />
      <view class="favorites-grid">
        <view v-for="pet in favoritePets" :key="pet.id" class="favorite-card card" @click="openPetDetail(pet)">
          <image class="favorite-card__image" :src="pet.image" mode="aspectFill" />
          <text class="favorite-card__name">{{ pet.name }}</text>
          <text class="favorite-card__term">{{ pet.solarTerm }}</text>
          <text class="favorite-card__quote">{{ pet.quote }}</text>
        </view>
      </view>
    </view>

    <view v-else class="card empty section-gap">
      <SectionTitle title="还没有收藏" />
      <text class="empty__content">去灵宠详情页点一下“收藏灵宠”，你喜欢的小家伙就会出现在这里。</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.favorites-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.favorite-card,
.empty {
  padding: 28rpx;
}

.favorite-card__image {
  display: block;
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.42);
  border: 1rpx solid rgba(255, 255, 255, 0.66);
}

.favorite-card__name {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.favorite-card__term,
.favorite-card__quote,
.empty__content {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}
</style>
