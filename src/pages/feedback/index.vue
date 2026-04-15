<script setup lang="ts">
import { reactive, ref } from 'vue'
import { submitFeedback } from '@/services/feedback'
import { useHome } from '@/composables/useHome'

const { homeData } = useHome()
const submitting = ref(false)
const statusText = ref('')

const form = reactive({
  category: '产品建议',
  content: '',
  contact: '',
})

const categories = ['产品建议', 'Bug 反馈', '体验问题', '其他']

function handleCategoryChange(event: Event) {
  const value = Number((event as { detail?: { value?: string | number } }).detail?.value ?? 0)
  form.category = categories[value] ?? categories[0]
}

async function handleSubmit() {
  if (!form.content.trim()) {
    statusText.value = '请先填写反馈内容。'
    return
  }

  submitting.value = true
  statusText.value = ''

  try {
    await submitFeedback({
      category: form.category,
      content: form.content.trim(),
      contact: form.contact.trim(),
      cityName: homeData.value.cityName,
      solarTerm: homeData.value.solarTerm,
    })
    form.category = '产品建议'
    form.content = ''
    form.contact = ''
    statusText.value = '反馈提交成功，谢谢你的建议。'
  } catch (error) {
    statusText.value = '当前无法提交反馈，请稍后再试。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="container">
    <view class="card section-gap feedback-card">
      <text class="feedback-card__title">意见反馈</text>
      <text class="feedback-card__desc">欢迎告诉我们你的建议、问题或使用感受。</text>

      <view class="feedback-field">
        <text class="feedback-field__label">问题类型</text>
        <picker :range="categories" @change="handleCategoryChange">
          <view class="feedback-picker">{{ form.category }}</view>
        </picker>
      </view>

      <view class="feedback-field">
        <text class="feedback-field__label">反馈内容</text>
        <textarea v-model="form.content" class="feedback-textarea" maxlength="500" placeholder="请输入你想告诉我们的内容" />
      </view>

      <view class="feedback-field">
        <text class="feedback-field__label">联系方式（选填）</text>
        <input v-model="form.contact" class="feedback-input" placeholder="微信 / 邮箱 / 手机号" />
      </view>

      <button class="primary-button" :loading="submitting" @click="handleSubmit">提交反馈</button>
      <text v-if="statusText" class="feedback-card__status">{{ statusText }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.feedback-card {
  padding: 28rpx;
}

.feedback-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.feedback-card__desc,
.feedback-card__status {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}

.feedback-field {
  margin-top: 24rpx;
}

.feedback-field__label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: $color-primary;
}

.feedback-picker,
.feedback-input,
.feedback-textarea {
  width: 100%;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(47, 95, 152, 0.12);
  box-sizing: border-box;
  color: $color-text-primary;
}

.feedback-textarea {
  min-height: 220rpx;
}
</style>
