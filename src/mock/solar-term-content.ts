import type { DetailedSuggestionSection, SuggestionSummary } from '@/types/home'
import { SOLAR_TERMS, type SeasonKey } from '@/constants/solar-terms'

export interface SolarTermContent {
  suggestions: SuggestionSummary[]
  detailedSuggestions: DetailedSuggestionSection[]
  knowledgeCards: Array<{ title: string; content: string }>
}

const seasonWear: Record<SeasonKey, string> = {
  spring: '早晚还有温差，适合薄外套、针织层叠，出门带一件轻便外搭会更稳妥。',
  summer: '白天热意明显，建议轻薄透气、便于排汗的穿法，注意防晒和空调房温差。',
  autumn: '体感开始转凉，适合长袖和轻外套组合，尤其要照顾肩颈和腹部的保暖。',
  winter: '寒意更重，保暖层和防风层都不能少，围巾、厚袜和保温材质会更舒服。',
}

const seasonFood: Record<SeasonKey, string> = {
  spring: '饮食上适合清爽、温润一点，多吃当季蔬菜，少一点厚重油腻。',
  summer: '适合补水、清淡和带一点清润口感的食物，避免过度贪凉。',
  autumn: '可以多吃润燥食物和时令果蔬，口味不用太重，重点是温和滋养。',
  winter: '适合温热、饱腹又不太腻的食物，慢慢补充能量，让身体暖起来。',
}

const seasonReminder: Record<SeasonKey, string> = {
  spring: '把节奏放柔一点，给身体一点舒展和醒过来的时间。',
  summer: '记得补水、遮阳，也给自己留出一点避开暑气的阴凉时间。',
  autumn: '天气转场的时候最适合慢一点，别忽略干燥和作息波动。',
  winter: '先照顾好保暖、休息和情绪稳定，冬天的节奏更适合慢慢来。',
}

const seasonSummary: Record<SeasonKey, string> = {
  spring: '空气和光线都在慢慢变柔，适合舒展、整理和把生活重新调回舒服的步调。',
  summer: '热度和活力都在往上走，适合轻盈、清爽和把精力放在真正重要的事上。',
  autumn: '万物慢慢收拢，适合减负、沉静和把生活重新梳理得更有边界感。',
  winter: '外界节奏更安静了，适合保暖、蓄力和把注意力放回自己身上。',
}

const seasonRest: Record<SeasonKey, string> = {
  spring: '顺着白天慢慢变长的节奏，早点睡、早点起，会更容易觉得轻快。',
  summer: '午后容易疲乏，适当休息、减少暴晒，能让一天的状态更平衡。',
  autumn: '气候变化会让人容易疲惫，稳定作息和适度活动能让身体更舒服。',
  winter: '冬天更适合收一点，早点休息、留足恢复时间，比硬撑更重要。',
}

const seasonOuting: Record<SeasonKey, string> = {
  spring: '出门适合散步、慢走和短时间户外活动，但别忘了留意风和温差。',
  summer: '尽量避开最晒和最热的时段，外出时注意遮阳、补水和休息。',
  autumn: '天气通常更宜人，适合散步和短途出行，但晨晚还是要留意添衣。',
  winter: '冬天出门要先照顾保暖和脚下安全，活动时间不必太久，舒服就好。',
}

const seasonNature: Record<SeasonKey, string> = {
  spring: '草木苏醒、枝叶舒展，风和光都带着刚刚开始的轻盈感。',
  summer: '蝉鸣、树影、热风和更长的白天，让季节显得明亮又饱满。',
  autumn: '凉风、露水、成熟果实和更清澈的天空，共同构成秋天的层次。',
  winter: '冷空气、霜雪、长夜和室内热气，是冬日最鲜明也最安静的背景。',
}

const termKnowledge: Record<string, { origin: string; phenology: string; folk: string; poem: string }> = {
  lichun: {
    origin: '立春是二十四节气之首，标志着春天正式开始，万物从沉寂中慢慢醒来。',
    phenology: '东风解冻、蛰虫始振、鱼陟负冰，是立春常被提到的时令物候。',
    folk: '迎春、咬春、打春牛，都是立春时节常见的传统习俗。',
    poem: '立春的意味不在热烈，而在“万物开始有了动静”。',
  },
  yushui: {
    origin: '雨水意味着降水开始增多，天气从“雪意”慢慢转向“雨意”。',
    phenology: '獭祭鱼、鸿雁来、草木萌动，都是雨水节气常见的自然信号。',
    folk: '民间有回娘屋、拉保保等习俗，寄托了对平安和顺遂的期待。',
    poem: '“好雨知时节”，最能形容雨水节气里那种安静润物的力量。',
  },
  jingzhe: {
    origin: '惊蛰因春雷始鸣而得名，意味着沉睡的生命开始活跃起来。',
    phenology: '桃始华、仓庚鸣、鹰化为鸠，勾勒出惊蛰时节的鲜活场景。',
    folk: '吃梨、驱虫、祭白虎等习俗，都和“醒来”与“避害”有关。',
    poem: '惊蛰最动人的地方，在于“雷声一响，世界像被轻轻推了一把”。',
  },
  chunfen: {
    origin: '春分这一天昼夜几乎平分，象征着春意从生发走向平衡。',
    phenology: '玄鸟至、雷乃发声、始电，是春分之后自然界越来越热闹的写照。',
    folk: '立蛋、踏青、放风筝，是春分时节轻盈又热闹的民俗活动。',
    poem: '春分的关键词不是浓烈，而是“刚刚好”。',
  },
  qingming: {
    origin: '清明既是节气，也是兼具自然与人文意味的重要时令节点。',
    phenology: '桐始华、田鼠化为鴽、虹始见，都和清明时节的湿润与明净有关。',
    folk: '扫墓、踏青、插柳，是清明最具代表性的传统活动。',
    poem: '清明不是单一的清冷，而是一种“想念与春意并行”的季节感。',
  },
  guyu: {
    origin: '谷雨取“雨生百谷”之意，是春季最后一个节气。',
    phenology: '萍始生、鸣鸠拂其羽、戴胜降于桑，说明农事和植物生长都更明显了。',
    folk: '喝谷雨茶、赏牡丹，是谷雨时节非常典型的生活方式。',
    poem: '谷雨的春天不再只是开始，而是认真地把生长推向丰盛。',
  },
  lixia: {
    origin: '立夏表示夏天开始登场，万物从舒展转向旺盛。',
    phenology: '蝼蝈鸣、蚯蚓出、王瓜生，是立夏时节最生动的自然信号。',
    folk: '称人、斗蛋、尝新，都是立夏的生活气息。',
    poem: '立夏的妙处在于，风和树影都开始带着热意。',
  },
  xiaoman: {
    origin: '小满的“满”不是圆满，而是“将熟未熟、将满未满”的分寸感。',
    phenology: '苦菜秀、靡草死、麦秋至，是小满时节常见的田野变化。',
    folk: '祭车神、祈蚕、尝新麦，体现了农事节奏和生活期待。',
    poem: '小满最难得的地方，在于“留一点余地，刚刚好”。',
  },
  mangzhong: {
    origin: '芒种是忙着播种和忙着收获并行的节气，节奏会明显加快。',
    phenology: '螳螂生、鵙始鸣、反舌无声，是芒种时节的典型物候。',
    folk: '送花神、安苗等习俗，寄托了对丰收和顺利的期望。',
    poem: '芒种的关键词不是焦虑，而是“该做的事认真去做”。',
  },
  xiazhi: {
    origin: '夏至是一年中白昼最长的节点，阳光和热度都到达高点。',
    phenology: '鹿角解、蝉始鸣、半夏生，勾勒出夏至之后更浓的夏意。',
    folk: '吃面、祭神、消夏，是夏至最常见的传统生活片段。',
    poem: '夏至像一口很满的阳光，把一天拉得很长。',
  },
  xiaoshu: {
    origin: '小暑意味着暑气渐盛，夏天进入更真实的炎热阶段。',
    phenology: '温风至、蟋蟀居宇、鹰始鸷，是小暑前后的自然反应。',
    folk: '食新、晒伏、吃藕，是小暑时节很有烟火气的选择。',
    poem: '小暑不一定猛烈，却会提醒你：夏天已经认真热起来了。',
  },
  dashu: {
    origin: '大暑是一年里暑气最盛的时候，也是夏季热度的顶点。',
    phenology: '腐草为萤、土润溽暑、大雨时行，是大暑最具代表性的气候图景。',
    folk: '晒伏姜、饮伏茶、吃仙草，是大暑常见的民间智慧。',
    poem: '大暑教人的不是逞强，而是给自己留一块阴凉。',
  },
  liqiu: {
    origin: '立秋表示秋天从节令上已经到来，但热意不会立刻退尽。',
    phenology: '凉风至、白露生、寒蝉鸣，是立秋最常被提到的三候。',
    folk: '啃秋、贴秋膘、晒秋，都是迎接季节转换的生活仪式。',
    poem: '立秋像一阵轻一点的风，先把“秋”的消息送过来。',
  },
  chushu: {
    origin: '处暑意味着暑气开始退场，气候会从闷热逐渐转向清爽。',
    phenology: '鹰乃祭鸟、天地始肃、禾乃登，是处暑之后的典型变化。',
    folk: '放河灯、开渔节、食鸭，是处暑时节很有画面感的习俗。',
    poem: '处暑的可贵，在于“终于可以慢慢松下来”。',
  },
  bailu: {
    origin: '白露强调昼夜温差变大，露水会在清晨更明显地出现。',
    phenology: '鸿雁来、玄鸟归、群鸟养羞，是白露时节常见的自然迁徙信号。',
    folk: '饮白露茶、酿白露酒，是顺应时令的传统方式。',
    poem: '白露的美，在于清晨那一点点薄凉和安静。',
  },
  qiufen: {
    origin: '秋分和春分相对，这一天昼夜再度接近平分。',
    phenology: '雷始收声、蛰虫坯户、水始涸，是秋分之后万物趋于收敛的写照。',
    folk: '祭月、吃秋菜、放风筝，都是秋分时节的经典活动。',
    poem: '秋分像把生活重新摆正，让忙和静都回到平衡。',
  },
  hanlu: {
    origin: '寒露比白露更冷，露气更重，秋意会明显加深。',
    phenology: '鸿雁来宾、雀入大水为蛤、菊有黄华，都是寒露时节的代表画面。',
    folk: '赏菊、登高、饮菊花酒，是寒露常见的时令活动。',
    poem: '寒露提醒你：秋天已经不只是凉，而是开始有点冷了。',
  },
  shuangjiang: {
    origin: '霜降是秋季最后一个节气，意味着冷空气和肃杀感进一步增强。',
    phenology: '豺乃祭兽、草木黄落、蛰虫咸俯，是霜降的典型物候。',
    folk: '吃柿子、赏红叶、进补，都是霜降常见的生活方式。',
    poem: '霜降不是结束，而是把秋天染成更成熟的颜色。',
  },
  lidong: {
    origin: '立冬表示冬季正式开始，生活节奏也会慢慢收拢。',
    phenology: '水始冰、地始冻、雉入大水为蜃，是立冬最具代表性的自然变化。',
    folk: '补冬、吃饺子、酿黄酒，都是立冬时节常见的仪式感。',
    poem: '立冬的关键词不是冷，而是“把暖先留给自己”。',
  },
  xiaoxue: {
    origin: '小雪并不一定真的下雪，而是气温与降水形式都更接近冬意。',
    phenology: '虹藏不见、天气上升地气下降、闭塞而成冬，是小雪的重要特征。',
    folk: '腌菜、做腊味、吃糍粑，是小雪时节常见的家庭活动。',
    poem: '小雪像把世界的音量轻轻调低了一格。',
  },
  daxue: {
    origin: '大雪意味着降雪可能性和寒冷程度都明显加深。',
    phenology: '鹖鴠不鸣、虎始交、荔挺出，是大雪的传统物候描述。',
    folk: '进补、封河、围炉，是大雪时节最有冬天味道的场景。',
    poem: '大雪教人慢下来，也提醒人把热气留在身边。',
  },
  dongzhi: {
    origin: '冬至是重要的岁时节点，白昼最短，之后阳气开始回升。',
    phenology: '蚯蚓结、麋角解、水泉动，是冬至常被提起的三候。',
    folk: '吃饺子、吃汤圆、祭祖团聚，是冬至最鲜明的节日感。',
    poem: '冬至真正动人的地方，是长夜里那一点团圆的热气。',
  },
  xiaohan: {
    origin: '小寒说明寒气渐重，冬天进入更深一层的冷意。',
    phenology: '雁北乡、鹊始巢、雉始鸲，是小寒之后自然界的变化。',
    folk: '吃腊八粥、泡脚、围炉，是小寒时节很适合的生活方式。',
    poem: '小寒像一句轻声提醒：别硬扛，暖一点会更好。',
  },
  dahan: {
    origin: '大寒通常是一年中最冷的节气，也接近岁末收尾。',
    phenology: '鸡始乳、征鸟厉疾、水泽腹坚，是大寒最常见的三候。',
    folk: '除尘、备年货、祭灶，说明大寒和新年的距离已经很近了。',
    poem: '大寒的尽头，不只是冷，也是一种“快要迎来新的开始”。',
  },
}

function createSuggestions(termName: string, season: SeasonKey): SuggestionSummary[] {
  return [
    { type: 'wear', title: '今天穿什么', content: `${termName}时节，${seasonWear[season]}` },
    { type: 'food', title: '今天吃点什么', content: `${termName}阶段，${seasonFood[season]}` },
    { type: 'reminder', title: '今天的小提醒', content: `${termName}里，${seasonReminder[season]}` },
  ]
}

function createDetailedSuggestions(termName: string, tagline: string, season: SeasonKey): DetailedSuggestionSection[] {
  return [
    { title: '今日总评', content: `${termName}到了，${tagline}。${seasonSummary[season]}` },
    { title: '穿衣建议', content: `${termName}期间，${seasonWear[season]}` },
    { title: '饮食建议', content: `${termName}适合的状态，是让饮食顺着节气走。${seasonFood[season]}` },
    { title: '作息建议', content: `${termName}更适合把作息调回舒服的节奏。${seasonRest[season]}` },
    { title: '出行提醒', content: `${termName}时节，${seasonOuting[season]}` },
  ]
}

function createKnowledgeCards(termId: string, termName: string, season: SeasonKey) {
  const knowledge = termKnowledge[termId]

  return [
    { title: '节气由来', content: knowledge.origin },
    { title: '三候物候', content: knowledge.phenology },
    { title: '民俗活动', content: knowledge.folk },
    { title: '诗词小句', content: knowledge.poem },
    { title: '自然意象', content: `${termName}的自然气质里，${seasonNature[season]}` },
  ]
}

export const SOLAR_TERM_CONTENT: Record<string, SolarTermContent> = Object.fromEntries(
  SOLAR_TERMS.map((term) => [
    term.id,
    {
      suggestions: createSuggestions(term.name, term.season),
      detailedSuggestions: createDetailedSuggestions(term.name, term.tagline, term.season),
      knowledgeCards: createKnowledgeCards(term.id, term.name, term.season),
    },
  ]),
) as Record<string, SolarTermContent>

export function getSolarTermContent(termId?: string): SolarTermContent {
  return SOLAR_TERM_CONTENT[termId || ''] ?? SOLAR_TERM_CONTENT.chunfen
}
