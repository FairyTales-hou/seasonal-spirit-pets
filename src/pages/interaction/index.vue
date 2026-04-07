<script setup lang="ts">
import { ref } from 'vue'
import PetHeroCard from '@/components/business/PetHeroCard.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { currentPet, homeData, interactionFeedback, interact: submitInteraction } = useHome()
const message = ref(homeData.value.interactionDone ? interactionFeedback[2] : '今天还没有和它打招呼')

function interact(action: string) {
  const result = submitInteraction(action)

  if (result) {
    message.value = result
    return
  }

  message.value = '今天已经陪过它啦，明天再来看看它的新心情。'
}
</script>

<template>
  <view class="container">
    <PetHeroCard :pet="currentPet" :bubble="homeData.petBubble" :weather-summary="homeData.weatherSummary" />

    <view class="card section-gap interaction-box">
      <SectionTitle title="今天想怎么陪它" caption="每日一次轻互动" />
      <view class="interaction-actions">
        <button class="primary-button" @click="interact('摸摸头')">摸摸头</button>
        <button class="secondary-button" @click="interact('喂一下')">喂一下</button>
        <button class="secondary-button" @click="interact('聊一句')">聊一句</button>
      </view>
      <text class="interaction-message">{{ message }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.interaction-box {
  padding: 28rpx;
}

.interaction-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.interaction-message {
  display: block;
  margin-top: 24rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}
</style>
