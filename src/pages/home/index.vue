<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/common/AppHeader.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import PetHeroCard from '@/components/business/PetHeroCard.vue'
import AlmanacCard from '@/components/business/AlmanacCard.vue'
import TipSummaryCard from '@/components/business/TipSummaryCard.vue'
import GrowthPanel from '@/components/business/GrowthPanel.vue'
import { useHome } from '@/composables/useHome'
import { ROUTES } from '@/constants/routes'
import { useAppStore } from '@/store/app'

const { homeData, currentPet } = useHome()
const appStore = useAppStore()
const instance = getCurrentInstance()

const CANVAS_ID = 'solar-share-card'
const canvasWidth = 1080
const canvasHeight = 1680
const shareCardFilePath = ref('')
const shareBusy = ref(false)

const copy = {
  headerPrefix: '今日',
  nextTerm: '距离下一个节气还有',
  days: '天',
  picksTitle: '今日建议',
  picksCaption: '一眼就能看完的轻提醒',
  nextTitle: '现在适合做什么',
  ritualBadge: '每日陪伴',
  ritualTitle: '去陪陪它',
  ritualDesc: '完成今天的一次轻互动',
  notesBadge: '节气小记',
  notesTitle: '看看节气小知识',
  notesDesc: '滑几张轻量知识卡',
  shareBadge: '今日可分享',
  shareTitle: '生成节气分享海报',
  shareDesc: '生成一张独立设计的分享图，包含节气、灵宠、日期与今日黄历信息。',
  previewButton: '预览海报',
  saveButton: '保存海报',
}

const headerSubtitle = computed(() => {
  const weekdayText = homeData.value.weekdayText?.trim()
  return weekdayText ? `${homeData.value.dateText} · ${weekdayText}` : homeData.value.dateText
})

const shareFeatureText = computed(() => {
  const parts = [
    homeData.value.solarTermTagline,
    currentPet.value.personality.slice(0, 3).join(' / '),
    currentPet.value.adviceStyle,
  ]

  return parts.filter(Boolean).join(' · ')
})

function goTo(url: string) {
  uni.navigateTo({ url })
}

function showToast(title: string, icon: 'none' | 'success' = 'none') {
  uni.showToast({ title, icon, duration: 1800 })
}

function getImageInfo(src: string) {
  return new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: resolve,
      fail: reject,
    })
  })
}

function roundRectPath(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  const nextRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + nextRadius, y)
  ctx.lineTo(x + width - nextRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + nextRadius)
  ctx.lineTo(x + width, y + height - nextRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height)
  ctx.lineTo(x + nextRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - nextRadius)
  ctx.lineTo(x, y + nextRadius)
  ctx.quadraticCurveTo(x, y, x + nextRadius, y)
  ctx.closePath()
}

function fillWrappedText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) {
  const chars = Array.from(text || '')
  const lines: string[] = []
  let current = ''

  chars.forEach((char) => {
    const next = `${current}${char}`
    if (ctx.measureText(next).width <= maxWidth) {
      current = next
      return
    }

    if (current) {
      lines.push(current)
    }
    current = char
  })

  if (current) {
    lines.push(current)
  }

  const clipped = lines.slice(0, maxLines).map((line, index) => {
    if (index !== maxLines - 1 || lines.length <= maxLines) {
      return line
    }

    let next = line
    while (next.length > 0 && ctx.measureText(`${next}...`).width > maxWidth) {
      next = next.slice(0, -1)
    }
    return `${next}...`
  })

  clipped.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight)
  })

  return y + Math.max(clipped.length, 1) * lineHeight
}

function drawCapsule(ctx: any, x: number, y: number, width: number, height: number, text: string) {
  roundRectPath(ctx, x, y, width, height, height / 2)
  ctx.setFillStyle('rgba(255,255,255,0.72)')
  ctx.fill()
  ctx.setStrokeStyle('rgba(255,255,255,0.85)')
  ctx.setLineWidth(2)
  ctx.stroke()
  ctx.setFillStyle('#2f5f98')
  ctx.setFontSize(24)
  ctx.fillText(text, x + 24, y + 34)
}

function drawTag(ctx: any, x: number, y: number, text: string) {
  const width = Math.max(112, ctx.measureText(text).width + 44)
  roundRectPath(ctx, x, y, width, 52, 26)
  ctx.setFillStyle('rgba(255,255,255,0.78)')
  ctx.fill()
  ctx.setStrokeStyle('rgba(255,255,255,0.92)')
  ctx.setLineWidth(2)
  ctx.stroke()
  ctx.setFillStyle('#7c5c39')
  ctx.setFontSize(22)
  ctx.fillText(text, x + 22, y + 34)
  return width
}

function drawSectionTitle(ctx: any, x: number, y: number, title: string) {
  ctx.setFillStyle('#2f5f98')
  ctx.setFontSize(24)
  ctx.fillText(title, x, y)
}

async function drawShareCard() {
  const petImage = await getImageInfo(currentPet.value.image)
  const almanac = homeData.value.almanac
  const suitableText = almanac?.suitableActivities.slice(0, 4).join('、') || '静心、整理、散步'
  const unsuitableText = almanac?.unsuitableActivities.slice(0, 4).join('、') || '熬夜、急躁、过劳'
  const weekdayText = homeData.value.weekdayText || ''
  const featureText = shareFeatureText.value || homeData.value.solarTermTagline
  const quoteText = currentPet.value.quote || homeData.value.petBubble

  return await new Promise<string>((resolve, reject) => {
    const ctx = uni.createCanvasContext(CANVAS_ID, instance?.proxy)

    const background = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
    background.addColorStop(0, '#f9f6f0')
    background.addColorStop(0.38, '#edf5fd')
    background.addColorStop(1, '#dde9f6')
    ctx.setFillStyle(background)
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.setGlobalAlpha(0.8)
    ctx.setFillStyle('rgba(255, 224, 188, 0.82)')
    ctx.beginPath()
    ctx.arc(180, 220, 160, 0, Math.PI * 2)
    ctx.fill()

    ctx.setFillStyle('rgba(124, 176, 233, 0.28)')
    ctx.beginPath()
    ctx.arc(928, 202, 190, 0, Math.PI * 2)
    ctx.fill()

    ctx.setFillStyle('rgba(103, 142, 193, 0.16)')
    ctx.beginPath()
    ctx.arc(882, 1328, 240, 0, Math.PI * 2)
    ctx.fill()
    ctx.setGlobalAlpha(1)

    roundRectPath(ctx, 48, 48, 984, 1584, 54)
    ctx.setFillStyle('rgba(255,255,255,0.54)')
    ctx.fill()
    ctx.setStrokeStyle('rgba(255,255,255,0.8)')
    ctx.setLineWidth(2)
    ctx.stroke()

    drawCapsule(ctx, 84, 96, 228, 54, '节气分享海报')

    ctx.setFillStyle('#18314f')
    ctx.setFontSize(96)
    ctx.fillText(homeData.value.solarTerm, 84, 238)

    ctx.setFillStyle('rgba(24, 49, 79, 0.76)')
    ctx.setFontSize(30)
    ctx.fillText(homeData.value.solarTermTagline, 90, 288)

    roundRectPath(ctx, 800, 100, 160, 188, 26)
    ctx.setFillStyle('rgba(247, 242, 232, 0.92)')
    ctx.fill()
    ctx.setStrokeStyle('rgba(201, 183, 153, 0.62)')
    ctx.setLineWidth(2)
    ctx.stroke()

    ctx.setFillStyle('#7c5c39')
    ctx.setFontSize(24)
    ctx.fillText('今日日期', 840, 146)
    ctx.setFillStyle('#18314f')
    ctx.setFontSize(46)
    ctx.fillText(String(new Date().getDate()).padStart(2, '0'), 842, 210)
    ctx.setFontSize(24)
    ctx.fillText(weekdayText || '', 840, 252)

    roundRectPath(ctx, 84, 346, 912, 520, 42)
    const heroGradient = ctx.createLinearGradient(84, 346, 996, 866)
    heroGradient.addColorStop(0, 'rgba(255,255,255,0.74)')
    heroGradient.addColorStop(1, 'rgba(225,238,251,0.82)')
    ctx.setFillStyle(heroGradient)
    ctx.fill()

    ctx.setFillStyle('rgba(54, 97, 146, 0.08)')
    ctx.beginPath()
    ctx.arc(542, 586, 226, 0, Math.PI * 2)
    ctx.fill()

    ctx.setFillStyle('rgba(255,255,255,0.52)')
    ctx.beginPath()
    ctx.arc(542, 586, 196, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(542, 586, 184, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(petImage.path, 358, 402, 368, 368)
    ctx.restore()

    const topTagWidth = drawTag(ctx, 126, 392, currentPet.value.name)
    drawTag(ctx, 142 + topTagWidth, 392, `${currentPet.value.solarTerm}灵宠`)

    ctx.setFillStyle('#18314f')
    ctx.setFontSize(30)
    fillWrappedText(ctx, featureText, 132, 764, 812, 42, 2)

    roundRectPath(ctx, 126, 806, 828, 86, 28)
    ctx.setFillStyle('rgba(255,255,255,0.62)')
    ctx.fill()
    ctx.setFillStyle('#4e657f')
    ctx.setFontSize(24)
    fillWrappedText(ctx, quoteText, 154, 856, 772, 32, 2)

    roundRectPath(ctx, 84, 918, 912, 312, 34)
    ctx.setFillStyle('rgba(250, 247, 240, 0.86)')
    ctx.fill()
    ctx.setStrokeStyle('rgba(215, 201, 175, 0.5)')
    ctx.setLineWidth(2)
    ctx.stroke()

    drawSectionTitle(ctx, 124, 978, '节气特点')
    ctx.setFillStyle('#18314f')
    ctx.setFontSize(32)
    fillWrappedText(ctx, featureText, 124, 1032, 820, 42, 3)

    drawSectionTitle(ctx, 124, 1168, '今日灵宠絮语')
    ctx.setFillStyle('rgba(24, 49, 79, 0.76)')
    ctx.setFontSize(28)
    fillWrappedText(ctx, homeData.value.petBubble, 124, 1218, 820, 38, 3)

    roundRectPath(ctx, 84, 1264, 912, 276, 34)
    const almanacGradient = ctx.createLinearGradient(84, 1264, 996, 1540)
    almanacGradient.addColorStop(0, 'rgba(243, 248, 255, 0.96)')
    almanacGradient.addColorStop(1, 'rgba(235, 242, 250, 0.92)')
    ctx.setFillStyle(almanacGradient)
    ctx.fill()

    drawSectionTitle(ctx, 124, 1322, '今日黄历')
    ctx.setFillStyle('rgba(24, 49, 79, 0.68)')
    ctx.setFontSize(24)
    ctx.fillText(almanac?.lunarText || '农历信息生成中', 124, 1364)

    ctx.setFillStyle('#18314f')
    ctx.setFontSize(30)
    ctx.fillText(`宜：${suitableText}`, 124, 1424)
    ctx.fillText(`忌：${unsuitableText}`, 124, 1478)

    ctx.setFillStyle('rgba(24, 49, 79, 0.74)')
    ctx.setFontSize(24)
    fillWrappedText(ctx, almanac?.seasonalHint || homeData.value.solarTermTagline, 124, 1528, 818, 32, 2)

    ctx.setFillStyle('rgba(47, 95, 152, 0.9)')
    ctx.setFontSize(22)
    ctx.fillText(`${homeData.value.dateText}${weekdayText ? ` · ${weekdayText}` : ''}`, 84, 1594)

    ctx.setFillStyle('rgba(24, 49, 79, 0.48)')
    ctx.setFontSize(22)
    ctx.fillText('Seasonal Spirit Pets', 786, 1594)

    ctx.draw(false, () => {
      uni.canvasToTempFilePath(
        {
          canvasId: CANVAS_ID,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth,
          destHeight: canvasHeight,
          fileType: 'png',
          quality: 1,
          success: (res) => resolve(res.tempFilePath),
          fail: reject,
        },
        instance?.proxy,
      )
    })
  })
}

async function ensureShareCardFile() {
  if (shareCardFilePath.value) {
    return shareCardFilePath.value
  }

  shareBusy.value = true
  uni.showLoading({ title: '生成中...' })

  try {
    await nextTick()
    const tempPath = await drawShareCard()
    shareCardFilePath.value = tempPath
    return tempPath
  } catch (error) {
    console.error('[share-card] 生成失败', error)
    showToast('海报生成失败')
    return ''
  } finally {
    shareBusy.value = false
    uni.hideLoading()
  }
}

async function previewShareCard() {
  const tempPath = await ensureShareCardFile()
  if (!tempPath) {
    return
  }

  uni.previewImage({
    urls: [tempPath],
    current: tempPath,
  })
}

async function saveShareCard() {
  const tempPath = await ensureShareCardFile()
  if (!tempPath) {
    return
  }

  uni.saveImageToPhotosAlbum({
    filePath: tempPath,
    success: () => showToast('已保存到相册', 'success'),
    fail: () => {
      showToast('当前环境不支持直接保存，已为你打开预览')
      uni.previewImage({
        urls: [tempPath],
        current: tempPath,
      })
    },
  })
}

onShow(() => {
  shareCardFilePath.value = ''
  if (!appStore.hasOnboarded) {
    uni.reLaunch({ url: ROUTES.onboarding })
  }
})
</script>

<template>
  <view class="container">
    <view class="floating floating--left" />
    <view class="floating floating--right" />

    <AppHeader :title="`${copy.headerPrefix} · ${homeData.solarTerm}`" :subtitle="headerSubtitle" />

    <view class="topline card section-gap">
      <text class="pill">{{ homeData.solarTermTagline }}</text>
      <text class="topline__text">{{ copy.nextTerm }} {{ homeData.daysUntilNextTerm }} {{ copy.days }}</text>
    </view>

    <view class="section-gap" @click="goTo(ROUTES.petDetail)">
      <PetHeroCard :pet="currentPet" :bubble="homeData.petBubble" :weather-summary="homeData.weatherSummary" />
    </view>

    <view class="section-gap">
      <view class="share-panel card">
        <view class="share-panel__meta">
          <text class="share-panel__badge">{{ copy.shareBadge }}</text>
          <text class="share-panel__title">{{ copy.shareTitle }}</text>
          <text class="share-panel__desc">{{ copy.shareDesc }}</text>
        </view>

        <view class="share-panel__actions">
          <button class="secondary-button share-panel__button" :disabled="shareBusy" @click="previewShareCard">
            {{ shareBusy ? '生成中...' : copy.previewButton }}
          </button>
          <button class="primary-button share-panel__button" :disabled="shareBusy" @click="saveShareCard">
            {{ shareBusy ? '生成中...' : copy.saveButton }}
          </button>
        </view>
      </view>
    </view>

    <view v-if="homeData.almanac" class="section-gap">
      <AlmanacCard :almanac="homeData.almanac" />
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.picksTitle" :caption="copy.picksCaption" />
      <view class="tips-grid">
        <view v-for="item in homeData.suggestions" :key="item.title" @click="goTo(ROUTES.tipsDetail)">
          <TipSummaryCard :item="item" />
        </view>
      </view>
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.nextTitle" />
      <view class="action-grid">
        <button class="action-card card" @click="goTo(ROUTES.interaction)">
          <text class="action-card__badge">{{ copy.ritualBadge }}</text>
          <text class="action-card__title">{{ copy.ritualTitle }}</text>
          <text class="action-card__desc">{{ copy.ritualDesc }}</text>
        </button>
        <button class="action-card card" @click="goTo(ROUTES.knowledge)">
          <text class="action-card__badge">{{ copy.notesBadge }}</text>
          <text class="action-card__title">{{ copy.notesTitle }}</text>
          <text class="action-card__desc">{{ copy.notesDesc }}</text>
        </button>
      </view>
    </view>

    <view class="section-gap">
      <GrowthPanel
        :interaction-done="homeData.interactionDone"
        :streak-days="homeData.streakDays"
        :growth-value="homeData.growthValue"
        :next-level-growth="homeData.nextLevelGrowth"
      />
    </view>

    <canvas
      canvas-id="solar-share-card"
      class="share-canvas"
      :style="{ width: `${canvasWidth / 2}px`, height: `${canvasHeight / 2}px` }"
      :width="canvasWidth"
      :height="canvasHeight"
    />
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 24rpx;
}

.topline__text {
  font-size: 22rpx;
  color: $color-text-secondary;
}

.tips-grid,
.action-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-card {
  width: 100%;
  padding: 28rpx 24rpx;
  text-align: left;
}

.action-card__badge {
  display: inline-flex;
  margin-bottom: 16rpx;
  font-size: 20rpx;
  color: $color-primary;
  letter-spacing: 1.2rpx;
}

.action-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.action-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: $color-text-secondary;
}

.share-panel {
  padding: 28rpx 24rpx;
}

.share-panel__meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.share-panel__badge {
  display: inline-flex;
  width: fit-content;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.52);
  color: $color-primary;
  font-size: 20rpx;
  letter-spacing: 1.1rpx;
}

.share-panel__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.share-panel__desc {
  font-size: 24rpx;
  line-height: 1.72;
  color: $color-text-secondary;
}

.share-panel__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 24rpx;
}

.share-panel__button {
  min-height: 88rpx;
  font-size: 26rpx;
}

.share-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
}

.floating {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(14rpx);
  opacity: 0.85;
  pointer-events: none;
}

.floating--left {
  top: 160rpx;
  left: -36rpx;
  width: 120rpx;
  height: 120rpx;
  background: radial-gradient(circle, rgba(255, 219, 188, 0.88) 0%, rgba(255, 219, 188, 0) 72%);
}

.floating--right {
  top: 440rpx;
  right: -30rpx;
  width: 150rpx;
  height: 150rpx;
  background: radial-gradient(circle, rgba(136, 197, 255, 0.8) 0%, rgba(136, 197, 255, 0) 74%);
}
</style>
