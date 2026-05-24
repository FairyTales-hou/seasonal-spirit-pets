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
const canvasWidth = 360
const canvasHeight = 640
const posterWidth = 1080
const posterHeight = 1920
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

function drawSoftCircle(ctx: any, x: number, y: number, radius: number, color: string, alpha = 1) {
  ctx.save()
  ctx.setGlobalAlpha(alpha)
  ctx.setFillStyle(color)
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawDivider(ctx: any, x: number, y: number, width: number) {
  ctx.setStrokeStyle('rgba(47, 55, 74, 0.16)')
  ctx.setLineWidth(2)
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.stroke()
}

async function drawShareCard() {
  const petImage = await getImageInfo(currentPet.value.image)
  const almanac = homeData.value.almanac
  const suitableText = almanac?.suitableActivities.slice(0, 3).join('、') || '静心、整理、散步'
  const unsuitableText = almanac?.unsuitableActivities.slice(0, 3).join('、') || '熬夜、急躁、过劳'
  const weekdayText = homeData.value.weekdayText || ''
  const featureText = shareFeatureText.value || homeData.value.solarTermTagline
  const quoteText = currentPet.value.quote || homeData.value.petBubble
  const today = new Date()
  const monthText = String(today.getMonth() + 1).padStart(2, '0')
  const dayText = String(today.getDate()).padStart(2, '0')

  return await new Promise<string>((resolve, reject) => {
    const ctx = uni.createCanvasContext(CANVAS_ID, instance?.proxy)
    const renderScale = canvasWidth / posterWidth
    ctx.scale(renderScale, renderScale)

    const background = ctx.createLinearGradient(0, 0, posterWidth, posterHeight)
    background.addColorStop(0, '#4a4e62')
    background.addColorStop(0.38, '#d9d8ca')
    background.addColorStop(0.72, '#f4eadc')
    background.addColorStop(1, '#9dbdd1')
    ctx.setFillStyle(background)
    ctx.fillRect(0, 0, posterWidth, posterHeight)

    drawSoftCircle(ctx, 168, 418, 280, 'rgba(255, 210, 160, 0.56)')
    drawSoftCircle(ctx, 892, 360, 260, 'rgba(118, 151, 190, 0.42)')
    drawSoftCircle(ctx, 250, 1390, 340, 'rgba(196, 225, 215, 0.58)')
    drawSoftCircle(ctx, 882, 1490, 300, 'rgba(255, 170, 142, 0.38)')

    ctx.setFillStyle('rgba(255,255,255,0.16)')
    ctx.fillRect(0, 0, posterWidth, posterHeight)

    ctx.setFillStyle('rgba(255,255,255,0.88)')
    ctx.setFontSize(34)
    ctx.setTextAlign('center')
    ctx.fillText('节气灵宠签', posterWidth / 2, 128)
    ctx.setFillStyle('rgba(255,255,255,0.66)')
    ctx.setFontSize(28)
    ctx.fillText('# 今日节气正在陪你 #', posterWidth / 2, 190)
    ctx.setTextAlign('left')

    const cardX = 70
    const cardY = 260
    const cardW = 940
    const cardH = 1328

    ctx.setShadow(0, 30, 70, 'rgba(45, 49, 62, 0.22)')
    roundRectPath(ctx, cardX, cardY, cardW, cardH, 48)
    const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH)
    cardGradient.addColorStop(0, 'rgba(255, 233, 168, 0.95)')
    cardGradient.addColorStop(0.18, 'rgba(255, 248, 219, 0.97)')
    cardGradient.addColorStop(0.58, 'rgba(255, 253, 245, 0.99)')
    cardGradient.addColorStop(1, 'rgba(255,255,255,0.96)')
    ctx.setFillStyle(cardGradient)
    ctx.fill()
    ctx.setShadow(0, 0, 0, 'rgba(0,0,0,0)')
    ctx.setStrokeStyle('rgba(255,255,255,0.78)')
    ctx.setLineWidth(3)
    ctx.stroke()

    const coverX = 126
    const coverY = 318
    const coverW = 828
    const coverH = 632
    roundRectPath(ctx, coverX, coverY, coverW, coverH, 28)
    const coverGradient = ctx.createLinearGradient(coverX, coverY, coverX + coverW, coverY + coverH)
    coverGradient.addColorStop(0, '#f8dfa2')
    coverGradient.addColorStop(0.45, '#fff6d9')
    coverGradient.addColorStop(1, '#d9e9f6')
    ctx.setFillStyle(coverGradient)
    ctx.fill()

    ctx.save()
    roundRectPath(ctx, coverX + 28, coverY + 28, coverW - 56, coverH - 56, 22)
    ctx.clip()
    drawSoftCircle(ctx, 320, 526, 210, 'rgba(255, 221, 154, 0.68)')
    drawSoftCircle(ctx, 775, 574, 248, 'rgba(117, 164, 210, 0.22)')
    drawSoftCircle(ctx, 780, 610, 188, 'rgba(255,255,255,0.7)')
    ctx.drawImage(petImage.path, 608, 410, 310, 310)

    ctx.setFillStyle('rgba(255,255,255,0.62)')
    ctx.fillRect(coverX + 28, coverY + coverH - 160, coverW - 56, 160)
    ctx.restore()

    ctx.setStrokeStyle('rgba(89, 79, 59, 0.16)')
    ctx.setLineWidth(2)
    roundRectPath(ctx, coverX + 28, coverY + 28, coverW - 56, coverH - 56, 22)
    ctx.stroke()

    ctx.setFillStyle('rgba(255,255,255,0.68)')
    ctx.setFontSize(22)
    ctx.fillText('✦  ✦', coverX + 378, coverY + 76)
    ctx.setFillStyle('#31415d')
    ctx.setFontSize(28)
    ctx.fillText(currentPet.value.name, coverX + 74, coverY + coverH - 118)
    ctx.setFillStyle('rgba(49, 65, 93, 0.72)')
    ctx.setFontSize(24)
    ctx.fillText(`${currentPet.value.solarTerm}灵宠`, coverX + 74, coverY + coverH - 78)

    ctx.setTextAlign('right')
    ctx.setFillStyle('rgba(255,255,255,0.92)')
    ctx.setFontSize(72)
    ctx.fillText(homeData.value.solarTerm, coverX + coverW - 76, coverY + 256)
    ctx.setFillStyle('rgba(255,255,255,0.74)')
    ctx.setFontSize(28)
    ctx.fillText('SOLAR TERM', coverX + coverW - 76, coverY + 302)
    ctx.setTextAlign('left')

    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(76)
    ctx.fillText(monthText, 126, 1066)
    ctx.setFillStyle('rgba(47, 55, 78, 0.58)')
    ctx.setFontSize(24)
    ctx.fillText('月', 246, 1056)
    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(76)
    ctx.fillText(dayText, 126, 1194)
    ctx.setFillStyle('rgba(47, 55, 78, 0.58)')
    ctx.setFontSize(24)
    ctx.fillText('日', 246, 1184)

    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(32)
    fillWrappedText(ctx, homeData.value.solarTermTagline, 352, 1062, 560, 46, 2)
    ctx.setFillStyle('rgba(47, 55, 78, 0.68)')
    ctx.setFontSize(24)
    ctx.fillText(`${homeData.value.dateText}${weekdayText ? ` · ${weekdayText}` : ''}`, 352, 1176)
    ctx.setFillStyle('rgba(47, 55, 78, 0.44)')
    ctx.setFontSize(24)
    ctx.fillText('— 今日节气心情', 704, 1240)

    ctx.setStrokeStyle('rgba(47, 55, 78, 0.24)')
    ctx.setLineWidth(3)
    ctx.setLineDash([8, 14], 0)
    ctx.beginPath()
    ctx.moveTo(126, 1282)
    ctx.lineTo(954, 1282)
    ctx.stroke()
    ctx.setLineDash([], 0)
    drawSoftCircle(ctx, 126, 1282, 10, '#c7d8b7')
    drawSoftCircle(ctx, 954, 1282, 10, '#c7d8b7')

    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(26)
    fillWrappedText(ctx, quoteText, 126, 1362, 828, 40, 2)

    drawDivider(ctx, 126, 1420, 828)

    ctx.setFillStyle('rgba(47, 55, 78, 0.52)')
    ctx.setFontSize(22)
    ctx.fillText('今日宜', 150, 1476)
    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(32)
    fillWrappedText(ctx, suitableText, 150, 1528, 300, 38, 2)

    ctx.setStrokeStyle('rgba(47, 55, 78, 0.12)')
    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.moveTo(540, 1456)
    ctx.lineTo(540, 1550)
    ctx.stroke()

    ctx.setFillStyle('rgba(47, 55, 78, 0.52)')
    ctx.setFontSize(22)
    ctx.fillText('今日忌', 626, 1476)
    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(32)
    fillWrappedText(ctx, unsuitableText, 626, 1528, 300, 38, 2)

    ctx.setFillStyle('rgba(47, 55, 78, 0.46)')
    ctx.setFontSize(22)
    ctx.fillText(almanac?.lunarText || '农历信息生成中', 126, 1640)
    ctx.setTextAlign('right')
    ctx.fillText('Seasonal Spirit Pets', 954, 1640)
    ctx.setTextAlign('left')

    roundRectPath(ctx, 170, 1696, 300, 92, 46)
    ctx.setFillStyle('rgba(255,255,255,0.92)')
    ctx.fill()
    ctx.setFillStyle('#2f374e')
    ctx.setFontSize(30)
    ctx.setTextAlign('center')
    ctx.fillText('保存节气签', 320, 1754)

    roundRectPath(ctx, 610, 1696, 300, 92, 46)
    ctx.setFillStyle('rgba(255,255,255,0.92)')
    ctx.fill()
    ctx.setFillStyle('#2f374e')
    ctx.fillText('去分享', 760, 1754)
    ctx.setTextAlign('left')

    ctx.draw(false, () => {
      uni.canvasToTempFilePath(
        {
          canvasId: CANVAS_ID,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: posterWidth,
          destHeight: posterHeight,
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
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
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
