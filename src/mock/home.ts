import type { DetailedSuggestionSection, HomeData, MineActionItem } from '@/types/home'

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
}

export const DETAILED_SUGGESTIONS: DetailedSuggestionSection[] = [
  { title: '今日总评', content: '今天的天气和节气都很温和，适合做一些舒展身体、放慢节奏的小事。别太赶，也别太闷着自己。' },
  { title: '穿衣建议', content: '早晚温差还在，建议用“薄内搭 + 轻外套”的搭配。中午如果有太阳，可以稍微穿轻一点。' },
  { title: '饮食建议', content: '这两天更适合清爽、温润一点的食物。可以多吃一点时令蔬菜，口味不必太重。' },
  { title: '果蔬推荐', content: '今天适合的应季选择有菠菜、香椿、草莓和梨，清新又不厚重。' },
  { title: '作息建议', content: '春天容易犯困，如果下午状态有点慢，可以站起来活动 5 分钟，或者看看窗外。' },
  { title: '出行提醒', content: '风不大，体感舒适，适合散步或短时间户外活动。如果你在北方地区，还是可以留意一点干燥问题。' },
]

export const KNOWLEDGE_CARDS = [
  { title: '节气由来', content: '春分是春季第四个节气，这一天昼夜几乎平分，意味着万物进入更平衡舒展的阶段。' },
  { title: '三候物候', content: '一候玄鸟至，二候雷乃发声，三候始电。春分之后，自然界会越来越热闹。' },
  { title: '民俗活动', content: '春分时节有竖蛋、踏青、放风筝等活动，人们会用轻松的方式迎接春天真正展开。' },
  { title: '诗词小句', content: '“春色从此分，春意正中和。”春分的关键词，不是浓烈，而是刚刚好。' },
  { title: '自然意象', content: '花枝、燕子、柔风和等长的日与夜，共同构成了春分最温柔的季节画面。' },
]

export const INTERACTION_FEEDBACK = [
  '分分把脑袋轻轻靠了过来，今天也谢谢你来看它。',
  '它眯起眼睛，像是把春天的风也一起抱住了。',
  '今天的陪伴值 +8，新的小表情快要解锁啦。',
]

export const INTERACTION_BUBBLES = [
  '今天被你轻轻接住了，它现在心情很好。',
  '小灵宠把这份陪伴偷偷收进了今天的春风里。',
  '它眯着眼看你，像在说：明天也来找我吧。',
]

export const MINE_ACTIONS: MineActionItem[] = [
  { title: '我的收藏', description: '把喜欢的灵宠先收藏在这里', available: true },
  { title: '连续陪伴记录', description: '看看这段时间和灵宠的陪伴状态', available: true },
  { title: '城市设置', description: '后续可切换城市与天气来源', available: false },
  { title: '提醒设置', description: '后续可设置节气提醒和互动提醒', available: false },
  { title: '意见反馈', description: '当前先做静态 MVP，后续会开放反馈入口', available: false },
  { title: '关于节气灵宠', description: '了解这个小项目想做成什么样子', available: true },
]
