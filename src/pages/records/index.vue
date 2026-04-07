<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'

const { currentPet, homeData } = useHome()
</script>

<template>
  <view class="container">
    <AppHeader title="连续陪伴记录" subtitle="把这段时间和灵宠相处的状态先轻轻记下来" />

    <view class="card record section-gap">
      <SectionTitle title="当前陪伴状态" />
      <text class="record__highlight">已经连续陪伴 {{ homeData.streakDays }} 天</text>
      <text class="record__content">
        这段时间一直在和 {{ currentPet.name }} 一起慢慢生活，今天的节气是 {{ homeData.solarTerm }}。
      </text>
    </view>

    <view class="card record section-gap">
      <SectionTitle title="成长进度" />
      <text class="record__highlight">{{ homeData.growthValue }} / {{ homeData.nextLevelGrowth }}</text>
      <text class="record__content">每次完成当天互动，都会让这份陪伴再往前长一点。</text>
    </view>

    <view class="card record section-gap">
      <SectionTitle title="今天的互动情况" />
      <text class="record__status" :class="homeData.interactionDone ? 'record__status--done' : 'record__status--waiting'">
        {{ homeData.interactionDone ? '今天已经陪过它了' : '今天还没有陪它' }}
      </text>
      <text class="record__content">
        {{ homeData.interactionDone ? '它已经收到你今天的陪伴，可以晚一点再来看看它。' : '如果你现在去和它打个招呼，这里的状态也会一起更新。' }}
      </text>
    </view>

    <view class="card record section-gap">
      <SectionTitle title="它现在的小心情" />
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
