<template>
  <view class="container">
    <view class="card section-gap legal-card">
      <text class="legal-card__title">用户协议</text>
      <text class="legal-card__content">
        节气灵宠当前提供的是轻量节气陪伴和内容浏览服务，相关天气、建议和互动内容仅供参考，不构成医疗、健康或其他专业建议。
      </text>
      <text class="legal-card__content">
        你应当合理使用应用功能，不得利用本应用提交违法、侵权或恶意内容。对于反馈内容，请确保你拥有相应表达和提交权利。
      </text>
      <text class="legal-card__content">
        随着版本演进，服务内容可能发生调整。重大变更会通过应用内文案或版本更新说明进行告知。
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
