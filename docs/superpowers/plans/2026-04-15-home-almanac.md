# Home Almanac Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight almanac card to the home page so users see fresh, traditional daily content even when the solar term itself has not changed.

**Architecture:** Introduce a small almanac data layer that converts the current date into a home-page-friendly structure using `lunar-javascript`, expose that structure through the existing home store/composable flow, and render a single quiet “今日黄历” card between the hero card and the suggestion list. Keep almanac failure non-blocking so the rest of the home page still renders normally.

**Tech Stack:** uni-app, Vue 3, TypeScript, Pinia, Sass, lunar-javascript, vue-tsc

---

## File structure

### Files to modify
- `package.json` — add `lunar-javascript` dependency
- `src/types/home.ts` — add almanac-related home data types
- `src/mock/home.ts` — seed default almanac content for initial render
- `src/store/home.ts` — compute and refresh almanac content alongside existing live home data
- `src/composables/useHome.ts` — expose almanac content to the home page
- `src/pages/home/index.vue` — insert the new almanac card between hero and suggestions

### Files to create
- `src/services/almanac.ts` — encapsulate `lunar-javascript` usage and map raw data into UI-ready almanac content
- `src/components/business/AlmanacCard.vue` — display lunar text, 宜/忌, and seasonal hint in a compact card

### Verification commands
- `corepack pnpm install`
- `corepack pnpm type-check`
- Optional manual check: `corepack pnpm dev:h5`

---

### Task 1: Add a focused almanac data service

**Files:**
- Modify: `package.json`
- Create: `src/services/almanac.ts`
- Test: `corepack pnpm type-check`

- [ ] **Step 1: Add the almanac dependency**

Update `package.json` dependencies:

```json
{
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-4080420251103001",
    "@dcloudio/uni-components": "3.0.0-4080420251103001",
    "@dcloudio/uni-h5": "3.0.0-4080420251103001",
    "@dcloudio/uni-mp-weixin": "3.0.0-4080420251103001",
    "@dcloudio/uni-ui": "^1.5.7",
    "@supabase/auth-js": "^2.103.0",
    "@supabase/functions-js": "^2.103.0",
    "@supabase/phoenix": "^0.4.0",
    "@supabase/postgrest-js": "^2.103.0",
    "@supabase/realtime-js": "^2.103.0",
    "@supabase/storage-js": "^2.103.0",
    "@supabase/supabase-js": "^2.103.0",
    "iceberg-js": "^0.8.1",
    "lunar-javascript": "^1.7.4",
    "pinia": "^2.1.7",
    "vue": "^3.4.21"
  }
}
```

- [ ] **Step 2: Install the new dependency**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm install`
Expected: PASS with `lunar-javascript` added to the lockfile.

- [ ] **Step 3: Create the almanac service**

Create `src/services/almanac.ts`:

```ts
import { Solar } from 'lunar-javascript'

export interface AlmanacContent {
  lunarText: string
  suitableActivities: string[]
  unsuitableActivities: string[]
  seasonalHint: string
}

const DEFAULT_ACTIVITY = '静心'

const TERM_HINTS: Record<string, string> = {
  立春: '立春时节，今天适合顺势舒展，把节奏慢慢打开。',
  雨水: '雨水时节，今天适合把日常安排得松一点，给自己留些回旋。',
  惊蛰: '惊蛰时节，今天适合动一动，也适合把搁置的小事重新捡起来。',
  春分: '春分时节，宜做轻整理，也适合出门透透气。',
  清明: '清明时节，今天适合把心绪放稳，认真过好眼前的小日常。',
  谷雨: '谷雨将近，今天适合把节奏放慢一点，先顾好日常。',
  立夏: '立夏时节，今天适合把状态提起来，但不用把自己推得太紧。',
  小满: '小满时节，今天适合踏实推进手头小事，不急着一下做满。',
  芒种: '芒种时节，今天适合先做要紧的事，再把节奏慢慢理顺。',
  夏至: '夏至时节，今天适合留一点空白，让忙碌里也有喘息。',
  小暑: '小暑时节，今天宜少一点躁进，多一点从容。',
  大暑: '大暑时节，今天适合把力气用在最重要的两三件事上。',
  立秋: '立秋时节，今天适合做一点收拢，也适合重新安排节奏。',
  处暑: '处暑时节，今天适合把日子过得清爽一些，别堆太满。',
  白露: '白露时节，今天适合收一收心，把注意力放回生活本身。',
  秋分: '秋分时节，今天适合把事情放平衡，不必急着求快。',
  寒露: '寒露时节，今天适合把步子放稳，先照顾好自己。',
  霜降: '霜降时节，今天适合做些安静的小事，让状态沉下来。',
  立冬: '立冬时节，今天适合蓄一蓄力，把生活过得温一点。',
  小雪: '小雪时节，今天适合收拢杂念，让节奏回到简单。',
  大雪: '大雪时节，今天适合把安排留松一些，别让自己太满。',
  冬至: '冬至时节，今天适合慢下来，做一点能让自己安心的小事。',
  小寒: '小寒时节，今天适合先稳住节奏，再处理外面的变化。',
  大寒: '大寒时节，今天适合把生活过得暖一点、稳一点。',
}

function normalizeActivities(values: string[] | undefined) {
  return (values ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function buildLunarText(date: Date) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  return `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
}

export function getAlmanacContent(date: Date, solarTerm: string): AlmanacContent {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const suitableActivities = normalizeActivities(lunar.getDayYi())
  const unsuitableActivities = normalizeActivities(lunar.getDayJi())

  return {
    lunarText: buildLunarText(date),
    suitableActivities: suitableActivities.length > 0 ? suitableActivities : [DEFAULT_ACTIVITY],
    unsuitableActivities: unsuitableActivities.length > 0 ? unsuitableActivities : [DEFAULT_ACTIVITY],
    seasonalHint: TERM_HINTS[solarTerm] ?? `${solarTerm}时节，今天适合把节奏放稳，认真过好眼前。`,
  }
}
```

- [ ] **Step 4: Run type-check to verify the service compiles**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm type-check`
Expected: PASS with the new service exporting `AlmanacContent` and `getAlmanacContent`.

- [ ] **Step 5: Commit the almanac service foundation**

```bash
git add package.json pnpm-lock.yaml src/services/almanac.ts
git commit -m "feat: add home almanac data service"
```

---

### Task 2: Extend home state with almanac content

**Files:**
- Modify: `src/types/home.ts`
- Modify: `src/mock/home.ts`
- Modify: `src/store/home.ts`
- Modify: `src/composables/useHome.ts`
- Test: `corepack pnpm type-check`

- [ ] **Step 1: Add a typed almanac shape to home types**

Update `src/types/home.ts`:

```ts
export interface AlmanacSummary {
  lunarText: string
  suitableActivities: string[]
  unsuitableActivities: string[]
  seasonalHint: string
}

export interface HomeData {
  dateText: string
  solarTerm: string
  solarTermTagline: string
  daysUntilNextTerm: number
  weatherSummary: string
  cityName: string
  petId: string
  petBubble: string
  suggestions: SuggestionSummary[]
  almanac: AlmanacSummary | null
  growthValue: number
  nextLevelGrowth: number
  streakDays: number
  interactionDone: boolean
  reminderEnabled: boolean
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
  reminderTime: string
}
```

- [ ] **Step 2: Seed default almanac content in mock home data**

Update `src/mock/home.ts`:

```ts
export const HOME_DATA: HomeData = {
  dateText: '2026 年 3 月 27 日',
  solarTerm: '春分',
  solarTermTagline: '昼夜平分，万物舒展',
  daysUntilNextTerm: 9,
  weatherSummary: '郑州 · 多云 18°C',
  cityName: '郑州',
  petId: 'chunfen',
  petBubble: '今天昼夜一样长，生活也可以刚刚好。',
  suggestions: [
    { type: 'wear', title: '今天穿什么', content: '早晚微凉，薄外套或针织衫会比较合适。' },
    { type: 'food', title: '今天吃点什么', content: '可以吃些清爽、温润的食物，别太油腻。' },
    { type: 'reminder', title: '今天的小提醒', content: '如果有春困，不如起身活动一下，晒晒太阳。' },
  ],
  almanac: {
    lunarText: '乙巳年二月初八',
    suitableActivities: ['出行', '整理', '祭祀'],
    unsuitableActivities: ['争执', '动土', '熬夜'],
    seasonalHint: '春分时节，宜做轻整理，也适合出门透透气。',
  },
  growthValue: 24,
  nextLevelGrowth: 40,
  streakDays: 3,
  interactionDone: false,
  reminderEnabled: true,
  dailyReminderEnabled: true,
  solarTermReminderEnabled: true,
  reminderTime: '20:30',
}
```

- [ ] **Step 3: Refresh almanac data with the rest of home live data**

Update `src/store/home.ts` imports:

```ts
import { getAlmanacContent } from '@/services/almanac'
```

Then update `refreshLiveData()`:

```ts
async refreshLiveData() {
  const now = new Date()
  const { term, daysUntilNext } = getCurrentSolarTerm(now)

  this.homeData.dateText = formatDateChinese(now)
  this.homeData.solarTerm = term.name
  this.homeData.solarTermTagline = term.tagline
  this.homeData.petId = term.id
  this.homeData.daysUntilNextTerm = daysUntilNext
  this.homeData.suggestions = getSolarTermContent(term.id).suggestions

  try {
    this.homeData.almanac = getAlmanacContent(now, term.name)
  } catch (error) {
    console.warn('[almanac] 生成失败，隐藏今日黄历卡', error)
    this.homeData.almanac = null
  }

  if (this.recordEntries.length === 0) {
    this.recordEntries = [createSeedRecord(toDateKey(now), term.name)]
  }

  try {
    const query = await getCity(this.homeData.cityName)
    const weather = await getWeatherSummary(query)
    const displayCity = weather.cityName || this.homeData.cityName
    this.homeData.cityName = displayCity
    this.homeData.weatherSummary = `${displayCity} · ${weather.text} ${weather.temp}°C`
  } catch (e) {
    console.warn('[weather] 获取失败，保留上一次天气数据', e)
  }

  void this.persist()
}
```

- [ ] **Step 4: Keep the almanac state available through the composable**

Update `src/composables/useHome.ts` to keep returning `homeData` as-is so pages can access `homeData.value.almanac`.

Expected return block to still include:

```ts
return {
  homeData,
  favoritePetIds,
  favoritePets,
  currentPet,
  getPetById,
  isFavoritePet,
  pets: PETS,
  unlockedPets,
  recordEntries,
  detailedSuggestions: computed(() => currentTermContent.value.detailedSuggestions),
  knowledgeCards: computed(() => currentTermContent.value.knowledgeCards),
  interactionFeedback: INTERACTION_FEEDBACK,
  mineActions: MINE_ACTIONS,
  interact: homeStore.interact,
  toggleFavoritePet: homeStore.toggleFavoritePet,
  saveCity: homeStore.saveCity,
  refreshWeatherByCity: homeStore.refreshWeatherByCity,
  saveReminderSettings: homeStore.saveReminderSettings,
}
```

- [ ] **Step 5: Run type-check to verify home state wiring**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm type-check`
Expected: PASS with `HomeData` and store usage aligned.

- [ ] **Step 6: Commit the home almanac state changes**

```bash
git add src/types/home.ts src/mock/home.ts src/store/home.ts src/composables/useHome.ts
git commit -m "feat: wire almanac content into home state"
```

---

### Task 3: Add a reusable almanac card component

**Files:**
- Create: `src/components/business/AlmanacCard.vue`
- Test: `corepack pnpm type-check`

- [ ] **Step 1: Create the almanac card component**

Create `src/components/business/AlmanacCard.vue`:

```vue
<script setup lang="ts">
import type { AlmanacSummary } from '@/types/home'

defineProps<{
  almanac: AlmanacSummary
}>()
</script>

<template>
  <view class="card almanac-card">
    <view class="almanac-card__header">
      <text class="almanac-card__title">今日黄历</text>
      <text class="almanac-card__lunar">{{ almanac.lunarText }}</text>
    </view>

    <view class="almanac-card__body">
      <view class="almanac-card__group">
        <text class="almanac-card__badge almanac-card__badge--good">宜</text>
        <view class="almanac-card__tags">
          <text v-for="item in almanac.suitableActivities" :key="`yi-${item}`" class="almanac-card__tag">
            {{ item }}
          </text>
        </view>
      </view>

      <view class="almanac-card__group">
        <text class="almanac-card__badge almanac-card__badge--avoid">忌</text>
        <view class="almanac-card__tags">
          <text v-for="item in almanac.unsuitableActivities" :key="`ji-${item}`" class="almanac-card__tag">
            {{ item }}
          </text>
        </view>
      </view>
    </view>

    <text class="almanac-card__hint">{{ almanac.seasonalHint }}</text>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.almanac-card {
  padding: 28rpx;
}

.almanac-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
}

.almanac-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.almanac-card__lunar {
  font-size: 22rpx;
  color: $color-text-secondary;
}

.almanac-card__body {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 20rpx;
}

.almanac-card__group {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
}

.almanac-card__badge {
  min-width: 40rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.almanac-card__badge--good {
  color: $color-primary;
}

.almanac-card__badge--avoid {
  color: $color-secondary;
}

.almanac-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.almanac-card__tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.64);
  font-size: 22rpx;
  color: $color-text-primary;
}

.almanac-card__hint {
  display: block;
  margin-top: 22rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}
</style>
```

- [ ] **Step 2: Run type-check to verify the new component compiles**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm type-check`
Expected: PASS with `AlmanacSummary` imported correctly.

- [ ] **Step 3: Commit the new card component**

```bash
git add src/components/business/AlmanacCard.vue
git commit -m "feat: add reusable home almanac card"
```

---

### Task 4: Insert the almanac card into the home page

**Files:**
- Modify: `src/pages/home/index.vue`
- Test: `corepack pnpm type-check`

- [ ] **Step 1: Import the new almanac card component**

Update the top of `src/pages/home/index.vue`:

```ts
import AlmanacCard from '@/components/business/AlmanacCard.vue'
```

- [ ] **Step 2: Render the almanac card between hero and suggestions**

Update `src/pages/home/index.vue` template:

```vue
    <view class="section-gap" @click="goTo(ROUTES.petDetail)">
      <PetHeroCard :pet="currentPet" :bubble="homeData.petBubble" :weather-summary="homeData.weatherSummary" />
    </view>

    <view v-if="homeData.almanac" class="section-gap">
      <AlmanacCard :almanac="homeData.almanac" />
    </view>

    <view class="section-gap">
      <SectionTitle :title="copy.picksTitle" :caption="copy.picksCaption" />
      <view class="tips-grid">
```

- [ ] **Step 3: Keep the page layout otherwise unchanged**

Do not add new click handlers, routes, or extra wrapper logic. The almanac card is display-only in v1.

- [ ] **Step 4: Run type-check to verify the page integration**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm type-check`
Expected: PASS with `homeData.almanac` guarded by `v-if`.

- [ ] **Step 5: Commit the home page integration**

```bash
git add src/pages/home/index.vue
git commit -m "feat: show almanac card on home page"
```

---

### Task 5: Final verification and fallback behavior check

**Files:**
- Modify: `src/services/almanac.ts`
- Modify: `src/store/home.ts`
- Test: `corepack pnpm type-check`
- Test: `corepack pnpm dev:h5`

- [ ] **Step 1: Ensure almanac output is always bounded**

Keep this in `src/services/almanac.ts`:

```ts
function normalizeActivities(values: string[] | undefined) {
  return (values ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}
```

This guarantees 宜 / 忌 each render at most 3 items.

- [ ] **Step 2: Ensure almanac failures remain non-blocking**

Keep this branch in `src/store/home.ts`:

```ts
try {
  this.homeData.almanac = getAlmanacContent(now, term.name)
} catch (error) {
  console.warn('[almanac] 生成失败，隐藏今日黄历卡', error)
  this.homeData.almanac = null
}
```

This keeps the rest of the home page rendering even if the almanac service fails.

- [ ] **Step 3: Run final type-check**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm type-check`
Expected: PASS.

- [ ] **Step 4: Run a manual H5 smoke test**

Run: `cd "/Users/anbei/my-project/seasonal-spirit-pets/.worktrees/p0-launch-settings" && corepack pnpm dev:h5`
Expected: local dev server starts and the following manual checks pass:
- 首页在灵宠卡下方展示“今日黄历”
- 农历日期显示正常
- 宜 / 忌各不超过 3 项
- 节气提示文案显示在卡片底部
- 如果临时让 `getAlmanacContent` 抛错，首页其他模块仍能正常渲染

- [ ] **Step 5: Commit the verification pass**

```bash
git add src/services/almanac.ts src/store/home.ts
git commit -m "fix: harden home almanac fallback behavior"
```

---

## Self-review checklist

### Spec coverage
- 首页新增单张节气生活卡：Task 3 + Task 4
- 农历日期：Task 1 + Task 2 + Task 3
- 今日宜 / 忌：Task 1 + Task 3 + Task 5
- 节气提示：Task 1 + Task 3
- 使用 `lunar-javascript`：Task 1
- `.ics` 仅作参考不作为正式依赖：plan 未引入 `.ics`，符合 spec
- 黄历失败时不阻断首页：Task 2 + Task 5

### Placeholder scan
- No TBD/TODO placeholders remain.
- Each file path is explicit.
- Each verification command is concrete.
- Each code step includes the exact code needed for the task.

### Type consistency
- `AlmanacSummary` in `src/types/home.ts` matches `AlmanacContent` mapping in `src/services/almanac.ts`.
- `homeData.almanac` is consistently nullable in state and guarded in the home page template.
- `suitableActivities`, `unsuitableActivities`, and `seasonalHint` use the same names across service, store, component, and page.
