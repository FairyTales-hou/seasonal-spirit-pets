<template>
  <view class="container">
    <view class="card section-gap legal-card">
      <text class="legal-card__title">隐私政策</text>
      <text class="legal-card__content">
        节气灵宠会保存你在应用内产生的必要使用数据，包括城市名称、收藏状态、互动记录和提醒偏好，用于提供个性化体验与数据同步能力。
      </text>
      <text class="legal-card__content">
        当你启用 Supabase 同步能力时，这些数据会与匿名用户身份绑定并存储到云端。当前版本不会采集与你身份实名直接相关的信息。
      </text>
      <text class="legal-card__content">
        如果你通过意见反馈页提交联系方式，该信息仅用于处理反馈，不会用于无关营销用途。
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.legal-card {
  padding: 28rpx;
}

.legal-card__title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.legal-card__content {
  display: block;
  margin-top: 18rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: $color-text-secondary;
}
</style>
