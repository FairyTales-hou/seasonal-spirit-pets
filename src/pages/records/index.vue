<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useHome } from '@/composables/useHome'
import type { RecordEntry } from '@/types/home'
import { toDateKey } from '@/utils/date'

const home = useHome()
const homeData = home.homeData
const currentPet = home.currentPet
const recordEntries = computed(() => home.recordEntries?.value ?? [])

const copy = {
  title: '连续陪伴记录',
  subtitle: '把每天和灵宠一起过的片段，整理成一条能回看的时间线。',
  timelineTitle: '按天时间线',
  timelineCaption: '每天都会沉淀一条可追溯的陪伴轨迹',
  eventsTitle: '历史事件',
  eventsCaption: '最近发生过的互动、提醒和成长变化',
  growthTitle: '成长节点',
  growthCaption: '把当前阶段里最值得记住的变化单独拎出来',
  emptyTitle: '还没有记录',
  emptyText: '完成一次陪伴后，这里就会开始积累时间线、历史事件和成长节点。',
}

interface TimelineGroup {
  dateKey: string
  label: string
  entries: RecordEntry[]
}

function toDateParts(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatRelativeDate(dateKey: string) {
  const todayKey = toDateKey(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toDateKey(yesterday)
  const target = toDateParts(dateKey)

  if (dateKey === todayKey) {
    return '今天'
  }

  if (dateKey === yesterdayKey) {
    return '昨天'
  }

  return `${target.getMonth() + 1} 月 ${target.getDate()} 日`
}

const timelineGroups = computed<TimelineGroup[]>(() => {
  const buckets = new Map<string, RecordEntry[]>()

  for (const entry of recordEntries.value) {
    const list = buckets.get(entry.dateKey) ?? []
    list.push(entry)
    buckets.set(entry.dateKey, list)
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([dateKey, entries]) => ({
      dateKey,
      label: formatRelativeDate(dateKey),
      entries,
    }))
})

const recentEvents = computed(() => recordEntries.value.slice(0, 5))

const growthNodes = computed(() => [
  {
    title: '连续陪伴',
    value: `${homeData.value.streakDays} 天`,
    desc: homeData.value.streakDays > 0 ? '今天这条陪伴线已经开始向前延展。' : '还没有开始连续陪伴，第一天会是最重要的一步。',
  },
  {
    title: '成长值',
    value: `${homeData.value.growthValue} / ${homeData.value.nextLevelGrowth}`,
    desc: '每完成一次互动，成长值都会向下一个阶段靠近一点。',
  },
  {
    title: '当前灵宠',
    value: currentPet.value.name,
    desc: `现在跟随的节气是「${homeData.value.solarTerm}」，记录会围绕它持续更新。`,
  },
])

function typeClass(type: RecordEntry['type']) {
  return `timeline-item--${type}`
}

function badgeClass(type: RecordEntry['type']) {
  return `event-badge--${type}`
}
</script>

<template>
  <view class="container">
    <AppHeader :title="copy.title" :subtitle="copy.subtitle" />

    <view class="summary card section-gap">
      <view class="summary__item">
        <text class="summary__label">连续陪伴</text>
        <text class="summary__value">{{ homeData.streakDays }} 天</text>
      </view>
      <view class="summary__item">
        <text class="summary__label">成长值</text>
        <text class="summary__value">{{ homeData.growthValue }} / {{ homeData.nextLevelGrowth }}</text>
      </view>
      <view class="summary__item">
        <text class="summary__label">当前节气</text>
        <text class="summary__value">{{ homeData.solarTerm }}</text>
      </view>
    </view>

    <view v-if="timelineGroups.length" class="section-gap">
      <SectionTitle :title="copy.timelineTitle" :caption="copy.timelineCaption" />
      <view class="timeline">
        <view v-for="group in timelineGroups" :key="group.dateKey" class="timeline-group card">
          <view class="timeline-group__head">
            <text class="timeline-group__title">{{ group.label }}</text>
            <text class="timeline-group__count">{{ group.entries.length }} 条</text>
          </view>
          <view
            v-for="entry in group.entries"
            :key="entry.id"
            class="timeline-item"
            :class="typeClass(entry.type)"
          >
            <view class="timeline-item__marker" />
            <view class="timeline-item__body">
              <view class="timeline-item__meta">
                <text class="event-badge" :class="badgeClass(entry.type)">{{ entry.badge }}</text>
                <text class="timeline-item__title">{{ entry.title }}</text>
              </view>
              <text class="timeline-item__content">{{ entry.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="card section-gap empty-state">
      <text class="empty-state__title">{{ copy.emptyTitle }}</text>
      <text class="empty-state__text">{{ copy.emptyText }}</text>
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.eventsTitle" :caption="copy.eventsCaption" />
      <view class="event-list">
        <view v-for="entry in recentEvents" :key="entry.id" class="event-card card">
          <text class="event-badge" :class="badgeClass(entry.type)">{{ entry.badge }}</text>
          <text class="event-card__title">{{ entry.title }}</text>
          <text class="event-card__content">{{ entry.content }}</text>
        </view>
      </view>
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.growthTitle" :caption="copy.growthCaption" />
      <view class="growth-grid">
        <view v-for="node in growthNodes" :key="node.title" class="growth-node card">
          <text class="growth-node__title">{{ node.title }}</text>
          <text class="growth-node__value">{{ node.value }}</text>
          <text class="growth-node__desc">{{ node.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  padding: 24rpx;
}

.summary__item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-height: 128rpx;
  padding: 18rpx 16rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.54);
  border: 1rpx solid rgba(255, 255, 255, 0.56);
}

.summary__label {
  font-size: 20rpx;
  color: $color-text-secondary;
}

.summary__value {
  margin-top: auto;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.timeline-group {
  padding: 24rpx;
}

.timeline-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 18rpx;
}

.timeline-group__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.timeline-group__count {
  font-size: 20rpx;
  color: $color-text-secondary;
}

.timeline-item {
  display: flex;
  gap: 14rpx;
  padding-top: 18rpx;
}

.timeline-item + .timeline-item {
  margin-top: 16rpx;
  border-top: 1rpx solid rgba(47, 95, 152, 0.08);
}

.timeline-item__marker {
  flex: none;
  width: 16rpx;
  height: 16rpx;
  margin-top: 12rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #89bbff 0%, #d9e9ff 100%);
  box-shadow: 0 0 0 8rpx rgba(137, 187, 255, 0.16);
}

.timeline-item__body {
  flex: 1;
}

.timeline-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
}

.timeline-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.timeline-item__content,
.event-card__content,
.growth-node__desc,
.empty-state__text {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.75;
  color: $color-text-secondary;
}

.timeline-item--interaction .timeline-item__marker {
  background: linear-gradient(135deg, #7db6ff 0%, #9ad4ff 100%);
}

.timeline-item--milestone .timeline-item__marker {
  background: linear-gradient(135deg, #ffc76c 0%, #ffe8b9 100%);
}

.timeline-item--system .timeline-item__marker {
  background: linear-gradient(135deg, #8dcfbc 0%, #daf6ec 100%);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.event-card {
  padding: 24rpx;
}

.event-badge {
  display: inline-flex;
  width: fit-content;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.event-badge--interaction {
  background: rgba(125, 182, 255, 0.16);
  color: $color-primary;
}

.event-badge--milestone {
  background: rgba(255, 199, 108, 0.18);
  color: #ba7900;
}

.event-badge--system {
  background: rgba(141, 207, 188, 0.18);
  color: #2f8f76;
}

.event-card__title,
.growth-node__title {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.growth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.growth-node {
  padding: 24rpx;
}

.growth-node__value {
  display: block;
  margin-top: 10rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: $color-primary;
}

.empty-state {
  padding: 36rpx 28rpx;
}

.empty-state__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}
</style>
