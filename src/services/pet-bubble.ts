import type { AlmanacSummary } from '@/types/home'
import { toDateKey } from '@/utils/date'

interface PetBubblePayload {
  date: Date
  solarTerm: string
  petName: string
  solarTermTagline: string
  almanac: AlmanacSummary | null
}

const DEFAULT_BUBBLES = [
  '{solarTerm}的风已经到了，{petName}想陪你把今天过得更从容一些。',
  '今天适合顺着{solarTerm}的节奏慢慢来，{petName}会一直在这里。',
  '{petName}觉得，{solarTerm}里最好的状态，就是把日子过得刚刚好。',
]

const ALMANAC_BUBBLES = [
  '今日宜{activity}，{petName}想和你一起把{solarTerm}过得轻盈一点。',
  '{solarTerm}里的今天，先从{activity}开始，整个人都会更舒展。',
  '{petName}偷偷提醒你：今天宜{activity}，也宜对自己温柔一点。',
]

const HINT_BUBBLES = [
  '{petName}想把一句节气提示送给你：{hint}',
  '{solarTerm}到了，{petName}今天最想说的是：{hint}',
]

function pickByDate(date: Date, list: string[]) {
  const seed = Array.from(toDateKey(date)).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return list[seed % list.length] ?? list[0]
}

function fillTemplate(template: string, payload: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => payload[key] ?? '')
}

export function getDynamicPetBubble(payload: PetBubblePayload) {
  const activity = payload.almanac?.suitableActivities?.[0] ?? '静心'
  const hint = payload.almanac?.seasonalHint || payload.solarTermTagline

  const source =
    payload.almanac?.suitableActivities?.length
      ? pickByDate(payload.date, ALMANAC_BUBBLES)
      : payload.almanac?.seasonalHint
        ? pickByDate(payload.date, HINT_BUBBLES)
        : pickByDate(payload.date, DEFAULT_BUBBLES)

  return fillTemplate(source, {
    solarTerm: payload.solarTerm,
    petName: payload.petName,
    activity,
    hint,
  })
}
