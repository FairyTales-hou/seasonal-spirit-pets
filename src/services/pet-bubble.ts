import { toDateKey } from '@/utils/date'

interface PetBubblePayload {
  date: Date
  solarTerm: string
  petName: string
  solarTermTagline: string
  weatherSummary?: string
  weatherBubble?: string
}

const DEFAULT_BUBBLES = [
  '{solarTerm}的节奏刚刚好，{petName}想陪你把今天过得更从容一些。',
  '今天适合顺着{solarTerm}慢慢来，{petName}会一直在这里。',
  '{petName}觉得，{solarTerm}里最好的状态，就是把日子过得刚刚好。',
]

const WEATHER_BUBBLES = [
  '今天{weather}，{petName}觉得很适合把步子放慢一点。',
  '如果你正看着{weather}，那就让{petName}陪你把这一天过得舒服些。',
  '{solarTerm}遇上{weather}，今天更适合做些轻松又顺手的事。',
]

const TERM_BUBBLES = [
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
  const weather = payload.weatherBubble?.trim()
  const hint = payload.solarTermTagline

  const source = weather
    ? pickByDate(payload.date, WEATHER_BUBBLES)
    : pickByDate(payload.date, TERM_BUBBLES.length > 0 ? TERM_BUBBLES : DEFAULT_BUBBLES)

  return fillTemplate(source, {
    solarTerm: payload.solarTerm,
    petName: payload.petName,
    weather: weather || '天气很舒服',
    hint,
  })
}
