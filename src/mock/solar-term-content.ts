import type { SuggestionSummary, DetailedSuggestionSection } from '@/types/home'

interface SolarTermContent {
  suggestions: SuggestionSummary[]
  detailedSuggestions: DetailedSuggestionSection[]
  knowledgeCards: { title: string; content: string }[]
}

export const SOLAR_TERM_CONTENT: Record<string, SolarTermContent> = {
  lichun: {
    suggestions: [
      { type: 'wear', title: '今天穿什么', content: '春寒料峭，羽绒服别急着收，出门加件外套更保险。' },
      { type: 'food', title: '今天吃点什么', content: '韭菜、春笋是应季好选择，温补不油腻。' },
      { type: 'reminder', title: '今天的小提醒', content: '立春开始可以慢慢恢复户外活动，但别急着减衣。' },
    ],
    detailedSuggestions: [
      { title: '今日总评', content: '立春是一年的开始，天气还带着冬意，但生机已经悄悄回来了。' },
      { title: '穿衣建议', content: '早晚仍然偏凉，建议保持冬季穿着，中午可以稍微减一件。' },
      { title: '饮食建议', content: '春天肝气旺盛，适合多吃绿叶蔬菜，少吃辛辣油腻。' },
      { title: '果蔬推荐', content: '韭菜、春笋、香椿都是立春时节的应季好物。' },
      { title: '作息建议', content: '春天阳气上升，早睡早起有助于顺应节气节律。' },
      { title: '出行提醒', content: '风偶尔还带着寒意，出门建议带件外套备用。' },
    ],
    knowledgeCards: [
      { title: '节气由来', content: '立春是二十四节气之首，标志着春天正式开始，万物复苏。' },
      { title: '三候物候', content: '一候东风解冻，二候蜇虫始振，三候鱼陟负冰。自然界缓缓醒来。' },
      { title: '民俗活动', content: '立春有咬春、打春牛等习俗，寓意迎接新一年的生机。' },
      { title: '诗词小句', content: '「东风解冻，散而为雨。」立春的风，是一年里最温柔的开场。' },
      { title: '自然意象', content: '冰雪开始融化，柳枝冒出嫩芽，候鸟陆续归来，春天悄悄靠近。' },
    ],
  },
  yushui: {
    suggestions: [
      { type: 'wear', title: '今天穿什么', content: '雨水时节湿气重，防水外套或雨衣比较实用。' },
      { type: 'food', title: '今天吃点什么', content: '适合喝粥、吃山药，健脾祛湿效果好。' },
      { type: 'reminder', title: '今天的小提醒', content: '出门带伞，雨水节气降雨概率明显升高。' },
    ],
    detailedSuggestions: [
      { title: '今日总评', content: '雨水节气，空气里都是柔软的水意，适合放慢节奏感受春天的润泽。' },
      { title: '穿衣建议', content: '湿冷天气建议穿防水外套，内搭保暖层，避免受潮着凉。' },
      { title: '饮食建议', content: '春季湿气偏重，饮食以健脾祛湿为主，少吃生冷食物。' },
      { title: '果蔬推荐', content: '山药、薏米、红豆都是这个时节祛湿的好食材。' },
      { title: '作息建议', content: '阴雨天气容易犯困，午休适当延长，保持精力充沛。' },
      { title: '出行提醒', content: '路面湿滑，骑车或步行注意安全，备好雨具。' },
    ],
    knowledgeCards: [
      { title: '节气由来', content: '雨水是春季第二个节气，此时降水增多，雪渐少而雨渐多。' },
      { title: '三候物候', content: '一候獭祭鱼，二候鸿雁来，三候草木萌动。万物在水的滋润下悄悄生长。' },
      { title: '民俗活动', content: '雨水节气有「拉保保」「撞拜寄」等民俗，寓意祈求平安健康。' },
      { title: '诗词小句', content: '「好雨知时节，当春乃发生。」杜甫写的就是这样的春雨。' },
      { title: '自然意象', content: '细雨绵绵，嫩草初绿，空气中弥漫着泥土和植物混合的清新气息。' },
    ],
  },
  jingzhe: {
    suggestions: [
      { type: 'wear', title: '今天穿什么', content: '惊蛰气温起伏大，洋葱式穿搭方便随时增减。' },
      { type: 'food', title: '今天吃点什么', content: '梨子润肺去燥，惊蛰时节吃梨是传统习俗。' },
      { type: 'reminder', title: '今天的小提醒', content: '春雷渐响，虫子开始活跃，注意家里的防虫防潮。' },
    ],
    detailedSuggestions: [
      { title: '今日总评', content: '惊蛰雷声一响，大地彻底醒过来了，万物都想动一动。' },
      { title: '穿衣建议', content: '气温变化幅度大，建议多层穿搭，早出晚归各一件外套备用。' },
      { title: '饮食建议', content: '惊蛰时节燥气较重，多吃润肺食物，梨、银耳、蜂蜜都很合适。' },
