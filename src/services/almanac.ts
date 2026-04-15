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
    .slice(0, 8)
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
