<script setup lang="ts">
import { ref } from 'vue'
import PetHeroCard from '@/components/business/PetHeroCard.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { currentPet, homeData, interactionFeedback, interact: submitInteraction } = useHome()

const copy = {
  empty: '今天还没有和它打招呼',
  done: '今天已经陪过它啦，明天再来看看它的新心情。',
  title: '今天想怎么陪它',
  caption: '每日一次轻互动',
  pat: '摸摸头',
  feed: '喂一下',
  talk: '聊一句',
}

const message = ref(homeData.value.interactionDone ? interactionFeedback[2] : copy.empty)

function interact(action: string) {
  const result = submitInteraction(action)

  if (result) {
    message.value = result
    return
  }

  message.value = copy.done
}
</script>

<template>
  <view class="container">
    <PetHeroCard :pet="currentPet" :bubble="homeData.petBubble" :weather-summary="homeData.weatherSummary" />

    <view class="card section-gap interaction-box">
      <SectionTitle :title="copy.title" :caption="copy.caption" />
      <view class="interaction-actions">
        <button class="primary-button" @click="interact(copy.pat)">{{ copy.pat }}</button>
        <button class="secondary-button" @click="interact(copy.feed)">{{ copy.feed }}</button>
        <button class="secondary-button" @click="interact(copy.talk)">{{ copy.talk }}</button>
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
