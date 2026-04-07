<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
</script>

<template>
  <view class="container">
    <AppHeader title="关于节气灵宠" subtitle="一个先从静态 MVP 开始的东方节气陪伴小项目" />

    <view class="card about section-gap">
      <SectionTitle title="这个项目想做什么" />
      <text class="about__content">
        节气灵宠想把二十四节气、轻量生活建议和一点点陪伴感放在一起。每天不用做很多事，只要打开看看今天的节气、认识当下的小灵宠，就能得到一点穿衣、饮食和作息上的温柔提醒。
      </text>
    </view>

    <view class="card about section-gap">
      <SectionTitle title="当前做到哪里了" />
      <text class="about__content">
        现在版本还是静态 MVP，先把首页、图鉴、灵宠详情、互动和基础个人页做出来，方便验证整体气质、页面节奏和内容方向是不是对的。
      </text>
    </view>

    <view class="card about section-gap">
      <SectionTitle title="后面会慢慢补什么" />
      <text class="about__content">
        后续会逐步补上真实城市与天气、收藏与陪伴记录、提醒设置，以及更完整的节气内容和互动反馈。先把核心体验打磨顺，再继续往外扩。
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.about {
  padding: 28rpx;
}

.about__content {
  display: block;
  font-size: 26rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}
</style>
