<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { currentPet, getPetById, isFavoritePet, toggleFavoritePet } = useHome()
const selectedPetId = ref('')

onLoad((options) => {
  selectedPetId.value = typeof options?.petId === 'string' ? options.petId : ''
})

const pet = computed(() => getPetById(selectedPetId.value) ?? currentPet.value)
const favoriteLabel = computed(() => (isFavoritePet(pet.value.id) ? '取消收藏' : '收藏灵宠'))

function handleToggleFavorite() {
  toggleFavoritePet(pet.value.id)
}
</script>

<template>
  <view class="container">
    <view class="card pet section-gap">
      <view class="pet__cover">
        <image class="pet__cover-image" :src="pet.image" mode="aspectFill" />
      </view>
      <text class="pet__name">{{ pet.name }} · {{ pet.solarTerm }}</text>
      <text class="pet__spirit">原型灵兽：{{ pet.spirit }}</text>
      <text class="pet__quote">{{ pet.quote }}</text>
      <button class="secondary-button pet__favorite-button" @click="handleToggleFavorite">{{ favoriteLabel }}</button>
    </view>

    <view class="card pet section-gap">
      <SectionTitle title="性格关键词" />
      <view class="pet__tags">
        <text v-for="item in pet.personality" :key="item" class="pet__tag">{{ item }}</text>
      </view>
    </view>

    <view class="card pet section-gap">
      <SectionTitle title="自然元素" />
      <view class="pet__tags">
        <text v-for="item in pet.elements" :key="item" class="pet__tag pet__tag--soft">{{ item }}</text>
      </view>
    </view>

    <view class="card pet section-gap">
      <SectionTitle title="建议风格" />
      <text class="pet__content">{{ pet.adviceStyle }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.pet {
  padding: 28rpx;
}

.pet__cover {
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  box-shadow:
    0 12rpx 36rpx rgba(26, 44, 80, 0.14),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
}

.pet__cover-image {
  width: 100%;
  height: 100%;
}

.pet__favorite-button {
  margin-top: 24rpx;
}

.pet__name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  text-align: center;
  color: $color-text-primary;
}

.pet__spirit,
.pet__quote,
.pet__content {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}

.pet__quote {
  text-align: center;
}

.pet__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.pet__tag {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: $color-bg-accent;
  color: $color-primary;
  font-size: 22rpx;
}

.pet__tag--soft {
  background: $color-bg-soft;
  color: $color-secondary;
}
</style>
