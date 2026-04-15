# P0 Launch Settings and Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the minimum launch-ready P0 surface for settings, legal pages, and in-app feedback without introducing a full account system.

**Architecture:** Reuse the existing Pinia home store and Supabase profile sync for city and reminder preferences, then add focused page-level UI for settings and legal content. Keep feedback separate from persisted home state by introducing a dedicated Supabase-backed feedback service and table, while updating the mine page to navigate by explicit routes instead of list position.

**Tech Stack:** uni-app, Vue 3, TypeScript, Pinia, Sass, Supabase, vue-tsc

---

## File structure

### Files to modify
- `src/constants/routes.ts` — add route constants for new settings, legal, and feedback pages
- `src/pages.json` — register the new pages with navigation titles
- `src/types/home.ts` — extend mine action typing and add reminder preference types if needed
- `src/mock/home.ts` — replace the current disabled mine actions with route-driven entries and add launch-ready labels/descriptions
- `src/composables/useHome.ts` — expose reminder settings and new store actions to pages
- `src/store/home.ts` — persist reminder preferences, allow explicit city saving, and keep existing sync behavior intact
- `src/services/home-profile.ts` — add reminder fields to payload/row mappings for Supabase sync
- `supabase/schema.sql` — extend `home_profiles` fields and add the `feedback_entries` table with RLS policies
- `src/pages/mine/index.vue` — route by explicit path and remove index-coupled navigation logic

### Files to create
- `src/services/feedback.ts` — submit feedback rows to Supabase
- `src/pages/settings/city.vue` — city settings UI with locate and manual input flows
- `src/pages/settings/reminder.vue` — reminder preference UI with explanatory copy
- `src/pages/feedback/index.vue` — feedback form UI and submission handling
- `src/pages/legal/privacy.vue` — local privacy policy page
- `src/pages/legal/terms.vue` — local terms page

### Verification commands
- `pnpm type-check`
- Optional manual check: `pnpm dev:h5`

---

### Task 1: Add route-driven settings navigation

**Files:**
- Modify: `src/constants/routes.ts`
- Modify: `src/types/home.ts`
- Modify: `src/mock/home.ts`
- Modify: `src/pages/mine/index.vue`
- Modify: `src/pages.json`
- Test: `pnpm type-check`

- [ ] **Step 1: Update route constants to include the new pages**

```ts
export const ROUTES = {
  onboarding: '/pages/onboarding/index',
  home: '/pages/home/index',
  atlas: '/pages/atlas/index',
  mine: '/pages/mine/index',
  favorites: '/pages/favorites/index',
  records: '/pages/records/index',
  about: '/pages/about/index',
  tipsDetail: '/pages/tips/detail',
  knowledge: '/pages/knowledge/index',
  interaction: '/pages/interaction/index',
  petDetail: '/pages/pet/detail',
  citySettings: '/pages/settings/city',
  reminderSettings: '/pages/settings/reminder',
  feedback: '/pages/feedback/index',
  privacy: '/pages/legal/privacy',
  terms: '/pages/legal/terms',
} as const
```

- [ ] **Step 2: Extend mine action typing to support route-driven navigation**

Update `src/types/home.ts` so `MineActionItem` carries its navigation target:

```ts
export interface MineActionItem {
  title: string
  description: string
  route: string
}
```

- [ ] **Step 3: Replace the mine action mock data with route-based entries**

Update `src/mock/home.ts` to remove `available` and provide explicit routes:

```ts
import { ROUTES } from '@/constants/routes'

export const MINE_ACTIONS: MineActionItem[] = [
  { title: '我的收藏', description: '把喜欢的灵宠先收藏在这里', route: ROUTES.favorites },
  { title: '连续陪伴记录', description: '看看这段时间和灵宠的陪伴状态', route: ROUTES.records },
  { title: '城市设置', description: '设置天气显示使用的城市', route: ROUTES.citySettings },
  { title: '提醒设置', description: '保存每日陪伴与节气提醒偏好', route: ROUTES.reminderSettings },
  { title: '意见反馈', description: '把你的建议或遇到的问题告诉我们', route: ROUTES.feedback },
  { title: '隐私政策', description: '查看数据收集和使用说明', route: ROUTES.privacy },
  { title: '用户协议', description: '查看使用条款和服务说明', route: ROUTES.terms },
  { title: '关于节气灵宠', description: '了解这个小项目想做成什么样子', route: ROUTES.about },
]
```

- [ ] **Step 4: Register the new pages in `src/pages.json`**

Add page records before the mine page entry:

```json
{
  "path": "pages/settings/city",
  "style": {
    "navigationBarTitleText": "城市设置"
  }
},
{
  "path": "pages/settings/reminder",
  "style": {
    "navigationBarTitleText": "提醒设置"
  }
},
{
  "path": "pages/feedback/index",
  "style": {
    "navigationBarTitleText": "意见反馈"
  }
},
{
  "path": "pages/legal/privacy",
  "style": {
    "navigationBarTitleText": "隐私政策"
  }
},
{
  "path": "pages/legal/terms",
  "style": {
    "navigationBarTitleText": "用户协议"
  }
}
```

- [ ] **Step 5: Refactor the mine page to navigate by route string**

Update `src/pages/mine/index.vue` to remove index logic and disabled styling:

```ts
function handleAction(route: string) {
  uni.navigateTo({ url: route })
}
```

Template loop:

```vue
<view
  v-for="item in mineActions"
  :key="item.title"
  class="actions__item card"
  @click="handleAction(item.route)"
>
```

- [ ] **Step 6: Run type-check to verify the navigation refactor**

Run: `pnpm type-check`
Expected: PASS with no type errors from `MineActionItem` updates.

- [ ] **Step 7: Commit the navigation foundation**

```bash
git add src/constants/routes.ts src/types/home.ts src/mock/home.ts src/pages/mine/index.vue src/pages.json
git commit -m "feat: add route-driven settings navigation"
```

---

### Task 2: Persist city and reminder preferences in the home store

**Files:**
- Modify: `src/types/home.ts`
- Modify: `src/mock/home.ts`
- Modify: `src/store/home.ts`
- Modify: `src/services/home-profile.ts`
- Modify: `src/composables/useHome.ts`
- Test: `pnpm type-check`

- [ ] **Step 1: Extend home-related types with reminder preferences**

Add reminder fields to `HomeData` in `src/types/home.ts`:

```ts
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

- [ ] **Step 2: Seed default reminder values in `HOME_DATA`**

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

- [ ] **Step 3: Extend persisted state and hydration in `src/store/home.ts`**

Update `HomeStorageState`:

```ts
interface HomeStorageState {
  interactionDone: boolean
  growthValue: number
  streakDays: number
  petBubble: string
  favoritePetIds: string[]
  cityName: string
  lastInteractDate: string
  recordEntries: RecordEntry[]
  reminderEnabled: boolean
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
  reminderTime: string
}
```

Add hydration branches inside `normalizeHydratedState`:

```ts
if (typeof savedState?.reminderEnabled === 'boolean') {
  this.homeData.reminderEnabled = savedState.reminderEnabled
}

if (typeof savedState?.dailyReminderEnabled === 'boolean') {
  this.homeData.dailyReminderEnabled = savedState.dailyReminderEnabled
}

if (typeof savedState?.solarTermReminderEnabled === 'boolean') {
  this.homeData.solarTermReminderEnabled = savedState.solarTermReminderEnabled
}

if (typeof savedState?.reminderTime === 'string' && savedState.reminderTime) {
  this.homeData.reminderTime = savedState.reminderTime
}
```

- [ ] **Step 4: Add explicit store actions for settings updates**

Add these actions to `src/store/home.ts`:

```ts
async saveCity(cityName: string) {
  const nextCity = cityName.trim()
  if (!nextCity) {
    throw new Error('城市不能为空')
  }

  this.homeData.cityName = nextCity
  await this.persist()
}

async refreshWeatherByCity() {
  try {
    const weather = await getWeatherSummary({
      location: this.homeData.cityName,
      fallbackCityName: this.homeData.cityName,
    })
    const displayCity = weather.cityName || this.homeData.cityName
    this.homeData.cityName = displayCity
    this.homeData.weatherSummary = `${displayCity} · ${weather.text} ${weather.temp}°C`
    await this.persist()
    return true
  } catch (error) {
    console.warn('[weather] 手动城市刷新失败，保留当前城市', error)
    await this.persist()
    return false
  }
}

async saveReminderSettings(payload: {
  reminderEnabled: boolean
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
  reminderTime: string
}) {
  this.homeData.reminderEnabled = payload.reminderEnabled
  this.homeData.dailyReminderEnabled = payload.dailyReminderEnabled
  this.homeData.solarTermReminderEnabled = payload.solarTermReminderEnabled
  this.homeData.reminderTime = payload.reminderTime
  await this.persist()
}
```

- [ ] **Step 5: Include reminder fields in the persisted payload and Supabase mapping**

Update `buildPersistPayload()` in `src/store/home.ts`:

```ts
return {
  interactionDone: this.homeData.interactionDone,
  growthValue: this.homeData.growthValue,
  streakDays: this.homeData.streakDays,
  petBubble: this.homeData.petBubble,
  favoritePetIds: this.favoritePetIds,
  cityName: this.homeData.cityName,
  lastInteractDate: this.lastInteractDate,
  recordEntries: this.recordEntries,
  reminderEnabled: this.homeData.reminderEnabled,
  dailyReminderEnabled: this.homeData.dailyReminderEnabled,
  solarTermReminderEnabled: this.homeData.solarTermReminderEnabled,
  reminderTime: this.homeData.reminderTime,
}
```

Update `src/services/home-profile.ts` interfaces and mappers:

```ts
export interface HomeProfilePayload {
  interactionDone: boolean
  growthValue: number
  streakDays: number
  petBubble: string
  favoritePetIds: string[]
  cityName: string
  lastInteractDate: string
  recordEntries: RecordEntry[]
  reminderEnabled: boolean
  dailyReminderEnabled: boolean
  solarTermReminderEnabled: boolean
  reminderTime: string
}
```

```ts
interface HomeProfileRow {
  interaction_done: boolean
  growth_value: number
  streak_days: number
  pet_bubble: string
  favorite_pet_ids: string[]
  city_name: string
  last_interact_date: string
  record_entries: RecordEntry[]
  reminder_enabled: boolean
  daily_reminder_enabled: boolean
  solar_term_reminder_enabled: boolean
  reminder_time: string
}
```

- [ ] **Step 6: Expose the new state and actions through `useHome`**

Update `src/composables/useHome.ts`:

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

- [ ] **Step 7: Run type-check to verify store and payload changes**

Run: `pnpm type-check`
Expected: PASS with `HomeData`, `HomeProfilePayload`, and `useHome` all aligned.

- [ ] **Step 8: Commit the persisted settings foundation**

```bash
git add src/types/home.ts src/mock/home.ts src/store/home.ts src/services/home-profile.ts src/composables/useHome.ts
git commit -m "feat: persist launch settings in home profile"
```

---

### Task 3: Build the city settings page

**Files:**
- Create: `src/pages/settings/city.vue`
- Modify: `src/composables/useHome.ts`
- Test: `pnpm type-check`

- [ ] **Step 1: Create the city settings page shell**

Create `src/pages/settings/city.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { getCity } from '@/utils/location'
import { useHome } from '@/composables/useHome'

const { homeData, saveCity, refreshWeatherByCity } = useHome()
const cityInput = ref(homeData.value.cityName)
const locating = ref(false)
const saving = ref(false)
const statusText = ref('')

async function handleUseCurrentLocation() {
  locating.value = true
  statusText.value = ''

  try {
    const query = await getCity(homeData.value.cityName)
    cityInput.value = query.fallbackCityName || query.location
    await saveCity(cityInput.value)
    const refreshed = await refreshWeatherByCity()
    statusText.value = refreshed ? '已更新当前城市与天气。' : '已保存当前城市，天气稍后刷新。'
  } catch (error) {
    statusText.value = '定位失败，请手动输入城市。'
  } finally {
    locating.value = false
  }
}

async function handleSave() {
  const nextCity = cityInput.value.trim()
  if (!nextCity) {
    statusText.value = '请输入城市名称。'
    return
  }

  saving.value = true
  statusText.value = ''

  try {
    await saveCity(nextCity)
    const refreshed = await refreshWeatherByCity()
    statusText.value = refreshed ? '城市已保存，天气已刷新。' : '城市已保存，天气稍后刷新。'
  } catch (error) {
    statusText.value = '城市保存失败，请稍后再试。'
  } finally {
    saving.value = false
  }
}
</script>
```

- [ ] **Step 2: Add the city settings template and styles**

Append this template and style block to `src/pages/settings/city.vue`:

```vue
<template>
  <view class="container">
    <view class="card section-gap settings-card">
      <text class="settings-card__label">当前城市</text>
      <text class="settings-card__value">{{ homeData.cityName }}</text>
      <text class="settings-card__desc">首页天气将优先使用这里保存的城市。</text>
    </view>

    <view class="card section-gap settings-card">
      <text class="settings-card__label">手动修改</text>
      <input v-model="cityInput" class="settings-input" placeholder="请输入城市名" />
      <button class="primary-button" :loading="saving" @click="handleSave">保存城市</button>
      <button class="secondary-button" :loading="locating" @click="handleUseCurrentLocation">使用当前位置</button>
      <text v-if="statusText" class="settings-card__status">{{ statusText }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.settings-card {
  padding: 28rpx;
}

.settings-card__label {
  display: block;
  font-size: 24rpx;
  color: $color-primary;
}

.settings-card__value {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.settings-card__desc,
.settings-card__status {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}

.settings-input {
  width: 100%;
  margin: 20rpx 0;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(47, 95, 152, 0.12);
  color: $color-text-primary;
  box-sizing: border-box;
}

.secondary-button {
  margin-top: 16rpx;
}
</style>
```

- [ ] **Step 3: Verify the city settings page compiles**

Run: `pnpm type-check`
Expected: PASS with no errors for `getCity`, `saveCity`, or template bindings.

- [ ] **Step 4: Commit the city settings page**

```bash
git add src/pages/settings/city.vue src/composables/useHome.ts
git commit -m "feat: add city settings page"
```

---

### Task 4: Build the reminder settings page

**Files:**
- Create: `src/pages/settings/reminder.vue`
- Modify: `src/composables/useHome.ts`
- Test: `pnpm type-check`

- [ ] **Step 1: Create the reminder settings page logic**

Create `src/pages/settings/reminder.vue`:

```vue
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useHome } from '@/composables/useHome'

const { homeData, saveReminderSettings } = useHome()
const saving = ref(false)
const statusText = ref('')

const form = reactive({
  reminderEnabled: homeData.value.reminderEnabled,
  dailyReminderEnabled: homeData.value.dailyReminderEnabled,
  solarTermReminderEnabled: homeData.value.solarTermReminderEnabled,
  reminderTime: homeData.value.reminderTime,
})

const childDisabled = computed(() => !form.reminderEnabled)

async function handleSave() {
  saving.value = true
  statusText.value = ''

  try {
    await saveReminderSettings({
      reminderEnabled: form.reminderEnabled,
      dailyReminderEnabled: form.dailyReminderEnabled,
      solarTermReminderEnabled: form.solarTermReminderEnabled,
      reminderTime: form.reminderTime,
    })
    statusText.value = '提醒偏好已保存，当前版本仅保存设置，不会实际发送提醒。'
  } catch (error) {
    statusText.value = '提醒设置保存失败，请稍后再试。'
  } finally {
    saving.value = false
  }
}
</script>
```

- [ ] **Step 2: Add the reminder settings UI and styles**

Append template/style:

```vue
<template>
  <view class="container">
    <view class="card section-gap settings-card">
      <text class="settings-card__title">提醒设置</text>
      <text class="settings-card__desc">当前版本仅保存提醒偏好，后续会接入真实提醒能力。</text>

      <label class="setting-row">
        <text class="setting-row__label">总开关</text>
        <switch :checked="form.reminderEnabled" @change="form.reminderEnabled = $event.detail.value" />
      </label>

      <label class="setting-row" :class="{ 'setting-row--disabled': childDisabled }">
        <text class="setting-row__label">每日陪伴提醒</text>
        <switch :disabled="childDisabled" :checked="form.dailyReminderEnabled" @change="form.dailyReminderEnabled = $event.detail.value" />
      </label>

      <label class="setting-row" :class="{ 'setting-row--disabled': childDisabled }">
        <text class="setting-row__label">节气切换提醒</text>
        <switch :disabled="childDisabled" :checked="form.solarTermReminderEnabled" @change="form.solarTermReminderEnabled = $event.detail.value" />
      </label>

      <view class="setting-time">
        <text class="setting-row__label">提醒时间</text>
        <input v-model="form.reminderTime" :disabled="childDisabled" class="settings-input" placeholder="20:30" />
      </view>

      <button class="primary-button" :loading="saving" @click="handleSave">保存设置</button>
      <text v-if="statusText" class="settings-card__status">{{ statusText }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.settings-card {
  padding: 28rpx;
}

.settings-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $color-text-primary;
}

.settings-card__desc,
.settings-card__status {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $color-text-secondary;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
}

.setting-row--disabled {
  opacity: 0.52;
}

.setting-row__label {
  font-size: 26rpx;
  color: $color-text-primary;
}

.setting-time {
  margin: 24rpx 0;
}

.settings-input {
  width: 100%;
  margin-top: 12rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(47, 95, 152, 0.12);
  color: $color-text-primary;
  box-sizing: border-box;
}
</style>
```

- [ ] **Step 3: Verify reminder settings compile cleanly**

Run: `pnpm type-check`
Expected: PASS with no errors around `switch` handlers or saved reminder payloads.

- [ ] **Step 4: Commit the reminder settings page**

```bash
git add src/pages/settings/reminder.vue
git commit -m "feat: add reminder settings page"
```

---

### Task 5: Add local privacy policy and terms pages

**Files:**
- Create: `src/pages/legal/privacy.vue`
- Create: `src/pages/legal/terms.vue`
- Test: `pnpm type-check`

- [ ] **Step 1: Create the privacy policy page**

Create `src/pages/legal/privacy.vue`:

```vue
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
```

- [ ] **Step 2: Create the terms page**

Create `src/pages/legal/terms.vue`:

```vue
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
```

- [ ] **Step 3: Run type-check after adding the legal pages**

Run: `pnpm type-check`
Expected: PASS with the new pages registered in `pages.json`.

- [ ] **Step 4: Commit the legal pages**

```bash
git add src/pages/legal/privacy.vue src/pages/legal/terms.vue
git commit -m "feat: add legal policy pages"
```

---

### Task 6: Add feedback schema and service

**Files:**
- Modify: `supabase/schema.sql`
- Create: `src/services/feedback.ts`
- Modify: `src/services/supabase.ts`
- Test: `pnpm type-check`

- [ ] **Step 1: Extend the Supabase schema for reminder columns and feedback entries**

Append to `supabase/schema.sql`:

```sql
alter table public.home_profiles
  add column if not exists reminder_enabled boolean not null default true,
  add column if not exists daily_reminder_enabled boolean not null default true,
  add column if not exists solar_term_reminder_enabled boolean not null default true,
  add column if not exists reminder_time text not null default '20:30';

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  content text not null,
  contact text not null default '',
  city_name text not null default '',
  solar_term text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists feedback_entries_user_id_idx
  on public.feedback_entries(user_id, created_at desc);

alter table public.feedback_entries enable row level security;

drop policy if exists "feedback_entries_insert_own" on public.feedback_entries;
create policy "feedback_entries_insert_own"
on public.feedback_entries
for insert
with check (auth.uid() = user_id);
```

- [ ] **Step 2: Add a dedicated feedback submission service**

Create `src/services/feedback.ts`:

```ts
import { ensureAnonymousUserId, isSupabaseEnabled, supabase } from '@/services/supabase'

export interface FeedbackPayload {
  category: string
  content: string
  contact: string
  cityName: string
  solarTerm: string
}

export async function submitFeedback(payload: FeedbackPayload) {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('SUPABASE_DISABLED')
  }

  const userId = await ensureAnonymousUserId()
  if (!userId) {
    throw new Error('ANONYMOUS_USER_UNAVAILABLE')
  }

  const result = await supabase.from('feedback_entries').insert({
    user_id: userId,
    category: payload.category,
    content: payload.content,
    contact: payload.contact,
    city_name: payload.cityName,
    solar_term: payload.solarTerm,
  })

  if (result.error) {
    throw result.error
  }
}
```

- [ ] **Step 3: Verify the feedback service compiles**

Run: `pnpm type-check`
Expected: PASS with the new `FeedbackPayload` service exported cleanly.

- [ ] **Step 4: Commit the backend contract changes**

```bash
git add supabase/schema.sql src/services/feedback.ts
git commit -m "feat: add feedback submission backend contract"
```

---

### Task 7: Build the in-app feedback page

**Files:**
- Create: `src/pages/feedback/index.vue`
- Modify: `src/composables/useHome.ts`
- Modify: `src/services/feedback.ts`
- Test: `pnpm type-check`

- [ ] **Step 1: Create the feedback page logic**

Create `src/pages/feedback/index.vue`:

```vue
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
```

- [ ] **Step 2: Add the feedback page UI and styles**

Append template/style:

```vue
<template>
  <view class="container">
    <view class="card section-gap feedback-card">
      <text class="feedback-card__title">意见反馈</text>
      <text class="feedback-card__desc">欢迎告诉我们你的建议、问题或使用感受。</text>

      <view class="feedback-field">
        <text class="feedback-field__label">问题类型</text>
        <picker :range="categories" @change="form.category = categories[$event.detail.value]">
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
```

- [ ] **Step 3: Verify the feedback page preserves form data on failed submit**

Check the logic in `handleSubmit()` and confirm only the success branch clears:

```ts
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
}
```

- [ ] **Step 4: Run type-check after wiring feedback UI**

Run: `pnpm type-check`
Expected: PASS with no errors for picker change handling or service imports.

- [ ] **Step 5: Commit the feedback page**

```bash
git add src/pages/feedback/index.vue src/services/feedback.ts
git commit -m "feat: add in-app feedback page"
```

---

### Task 8: Patch launch-critical error states and final verification

**Files:**
- Modify: `src/pages/settings/city.vue`
- Modify: `src/pages/settings/reminder.vue`
- Modify: `src/pages/feedback/index.vue`
- Modify: `src/main.ts`
- Test: `pnpm type-check`
- Test: `pnpm dev:h5`

- [ ] **Step 1: Make `refreshLiveData()` non-blocking at app startup**

Update `src/main.ts` so startup refresh failures do not surface as unhandled promises:

```ts
const homeStore = useHomeStore(pinia)
void homeStore.hydrate()
void homeStore.refreshLiveData()
```

- [ ] **Step 2: Make city status messages clearly distinguish save success from weather failure**

Keep this success/fallback logic in `src/pages/settings/city.vue`:

```ts
const refreshed = await refreshWeatherByCity()
statusText.value = refreshed ? '城市已保存，天气已刷新。' : '城市已保存，天气稍后刷新。'
```

- [ ] **Step 3: Keep reminder settings explicitly labeled as preference-only**

Retain this explanatory copy in `src/pages/settings/reminder.vue`:

```vue
<text class="settings-card__desc">当前版本仅保存提醒偏好，后续会接入真实提醒能力。</text>
```

- [ ] **Step 4: Keep the feedback unavailable state user-facing and non-destructive**

Keep the failure branch in `src/pages/feedback/index.vue` as:

```ts
} catch (error) {
  statusText.value = '当前无法提交反馈，请稍后再试。'
}
```

This preserves the typed content because the form reset remains inside the success branch only.

- [ ] **Step 5: Run final type-check**

Run: `pnpm type-check`
Expected: PASS.

- [ ] **Step 6: Run a manual H5 smoke test**

Run: `pnpm dev:h5`
Expected: local dev server starts successfully and the following manual checks pass:
- Mine page opens all new entries
- City page can save a manual city and attempt weather refresh
- Reminder page saves and reloads state
- Feedback page blocks empty submit and submits successfully when Supabase is configured
- Privacy and terms pages render static content

- [ ] **Step 7: Commit the verification pass**

```bash
git add src/main.ts src/pages/settings/city.vue src/pages/settings/reminder.vue src/pages/feedback/index.vue
git commit -m "fix: polish launch settings error states"
```

---

## Self-review checklist

### Spec coverage
- Settings hub navigation: Task 1
- City settings page and behavior: Task 2 + Task 3
- Reminder preference model and UI: Task 2 + Task 4
- Legal pages: Task 5
- Feedback service, schema, and UI: Task 6 + Task 7
- Basic failure-state handling: Task 3 + Task 4 + Task 7 + Task 8

### Placeholder scan
- No TBD/TODO placeholders remain.
- Each modified file path is explicit.
- Each command is concrete.
- Code snippets define the exact properties and methods referenced later in the plan.

### Type consistency
- `MineActionItem.route` is used consistently across mock data and mine page navigation.
- `HomeData` reminder fields align with `HomeStorageState` and `HomeProfilePayload`.
- `saveCity`, `refreshWeatherByCity`, and `saveReminderSettings` are referenced consistently between the store and `useHome`.
- `FeedbackPayload` field names match the feedback page submit call and Supabase insert row.
