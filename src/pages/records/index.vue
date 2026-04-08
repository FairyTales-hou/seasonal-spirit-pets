<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { currentPet, homeData } = useHome()

const copy = {
  title: '连续陪伴记录',
  subtitle: '把这段时间和灵宠相处的状态先轻轻记下来',
  currentStatus: '当前陪伴状态',
  streakText: '已经连续陪伴',
  streakSuffix: '天',
  currentContentPrefix: '这段时间一直在和',
  currentContentMiddle: '一起慢慢生活，今天的节气是',
  growth: '成长进度',
  growthDesc: '每次完成当天互动，都会让这份陪伴再往前长一点。',
  today: '今天的互动情况',
  done: '今天已经陪过它了',
  waiting: '今天还没有陪它',
  doneDesc: '它已经收到你今天的陪伴，可以晚一点再来看看它。',
  waitingDesc: '如果你现在去和它打个招呼，这里的状态也会一起更新。',
  mood: '它现在的小心情',
}
</script>

<template>
  <view class="container">
    <AppHeader :title="copy.title" :subtitle="copy.subtitle" />

    <view class="card record section-gap">
      <SectionTitle :title="copy.currentStatus" />
      <text class="record__highlight">{{ copy.streakText }} {{ homeData.streakDays }} {{ copy.streakSuffix }}</text>
      <text class="record__content">
        {{ copy.currentContentPrefix }} {{ currentPet.name }} {{ copy.currentContentMiddle }} {{ homeData.solarTerm }}。
      </text>
    </view>

    <view class="card record section-gap">
      <SectionTitle :title="copy.growth" />
      <text class="record__highlight">{{ homeData.growthValue }} / {{ homeData.nextLevelGrowth }}</text>
      <text class="record__content">{{ copy.growthDesc }}</text>
    </view>

    <view class="card record section-gap">
      <SectionTitle :title="copy.today" />
      <text class="record__status" :class="homeData.interactionDone ? 'record__status--done' : 'record__status--waiting'">
        {{ homeData.interactionDone ? copy.done : copy.waiting }}
      </text>
      <text class="record__content">
        {{ homeData.interactionDone ? copy.doneDesc : copy.waitingDesc }}
      </text>
    </view>

    <view class="card record section-gap">
      <SectionTitle :title="copy.mood" />
      <text class="record__bubble">“{{ homeData.petBubble }}”</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.record {
  padding: 28rpx;
}

.record__highlight,
.record__status,
.record__bubble,
.record__content {
  display: block;
}

.record__highlight {
  font-size: 34rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.record__status {
  font-size: 30rpx;
  font-weight: 600;
}

.record__status--done {
  color: $color-primary;
}

.record__status--waiting {
  color: $color-secondary;
}

.record__bubble,
.record__content {
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}
</style>
