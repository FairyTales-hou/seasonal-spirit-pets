# 节气灵宠 Seasonal Spirit Pets

一个基于 uni-app + Vue 3 的轻量节气陪伴小项目。当前版本以静态 MVP 为主，把二十四节气、灵宠设定、每日建议和轻互动放在同一个小应用里，先验证整体体验和内容方向。

## 当前已实现

- 首页展示当日节气、天气文案、灵宠气泡和基础生活建议
- 图鉴页浏览已解锁灵宠，并支持进入对应详情页
- 灵宠详情页展示性格、自然元素、建议风格
- 详情页支持收藏 / 取消收藏灵宠
- “我的收藏” 页面展示已收藏灵宠列表
- “连续陪伴记录” 页面展示当前连续天数、成长值、今日互动状态和灵宠气泡
- “去陪陪它” 页面支持每日一次轻互动，并把结果持久化到本地存储
- “关于节气灵宠” 页面说明项目目标与当前阶段

## 技术栈

- uni-app
- Vue 3
- TypeScript
- Pinia
- Sass

## 本地运行

先安装依赖：

```bash
pnpm install
```

启动 H5：

```bash
pnpm dev:h5
```

启动微信小程序：

```bash
pnpm dev:mp-weixin
```

构建 H5：

```bash
pnpm build:h5
```

构建微信小程序：

```bash
pnpm build:mp-weixin
```

类型检查：

```bash
pnpm type-check
```

## Supabase（可选）

项目已接入“本地优先 + Supabase 同步”模式，用于同步以下用户状态：

- 每日互动状态、成长值、连续天数、灵宠气泡
- 收藏灵宠列表
- 陪伴记录（`recordEntries`）
- 城市名与最后互动日期

### 1) 在 Supabase 执行表结构

把 `supabase/schema.sql` 在 Supabase SQL Editor 执行一次。

### 2) 配置环境变量

在 `.env.local` 添加：

```bash
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon key
```

未配置时会自动回退到纯本地存储模式，不影响运行。

## 主要页面

- `src/pages/onboarding/index`：进入应用前的欢迎页
- `src/pages/home/index`：首页，展示节气与今日建议
- `src/pages/atlas/index`：灵宠图鉴
- `src/pages/pet/detail`：灵宠详情页
- `src/pages/interaction/index`：每日轻互动
- `src/pages/knowledge/index`：节气知识卡片
- `src/pages/favorites/index`：我的收藏
- `src/pages/records/index`：连续陪伴记录
- `src/pages/about/index`：关于项目
- `src/pages/mine/index`：个人页入口聚合

## 数据与状态说明

当前项目仍以本地 mock 内容驱动界面，用户行为状态支持同步到 Supabase：

- `src/mock/home.ts`：首页内容、知识卡、互动反馈、我的页入口配置
- `src/mock/pets.ts`：灵宠图鉴与详情数据
- `src/store/home.ts`：首页核心状态，本地持久化 + Supabase 同步
- `src/services/supabase.ts`：Supabase 客户端与匿名登录
- `src/services/home-profile.ts`：主页状态的云端读写
- `src/composables/useHome.ts`：页面层复用的 home 数据访问封装

已持久化到本地存储的数据包括：

- `interactionDone`
- `growthValue`
- `streakDays`
- `petBubble`
- `favoritePetIds`

存储 key：`seasonal-spirit-pets:home`

## 当前 MVP 边界

当前还没有接入真实：

- 城市定位与实时天气
- 按日期沉淀的完整陪伴历史
- 提醒设置
- 用户反馈入口
- 更丰富的成长阶段与解锁机制

因此现在的“连续陪伴记录”是当前状态摘要，不是逐日时间线。

## 后续可继续完善的方向

- 接入真实城市 / 天气数据
- 扩展更多节气与灵宠内容
- 增加更完整的成长体系与互动反馈
- 补充提醒、反馈、设置等个人页能力
- 把静态 MVP 逐步过渡到可持续更新的数据模型
