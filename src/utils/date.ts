import { SOLAR_TERMS } from '@/constants/solar-terms'
import type { SolarTermItem } from '@/constants/solar-terms'

// 2025-2027 节气精确日期表（UTC+8，每年 24 个节气按序排列）
// 格式：[月(1-based), 日]
const SOLAR_TERM_DATES: Record<number, [number, number][]> = {
  2025: [
    [2, 3],
    [2, 18],
    [3, 5],
    [3, 20],
    [4, 4],
    [4, 20],
    [5, 5],
    [5, 21],
    [6, 5],
    [6, 21],
    [7, 7],
    [7, 22],
    [8, 7],
    [8, 23],
    [9, 7],
    [9, 23],
    [10, 8],
    [10, 23],
    [11, 7],
    [11, 22],
    [12, 7],
    [12, 22],
    [1, 5],
    [1, 20],
  ],
  2026: [
    [2, 4],
    [2, 18],
    [3, 5],
    [3, 20],
    [4, 5],
    [4, 20],
    [5, 5],
    [5, 21],
    [6, 6],
    [6, 21],
    [7, 7],
    [7, 23],
    [8, 7],
    [8, 23],
    [9, 8],
    [9, 23],
    [10, 8],
    [10, 23],
    [11, 7],
    [11, 22],
    [12, 7],
    [12, 22],
    [1, 5],
    [1, 20],
  ],
  2027: [
    [2, 3],
    [2, 18],
    [3, 6],
    [3, 21],
    [4, 5],
    [4, 20],
    [5, 6],
    [5, 21],
    [6, 6],
    [6, 21],
    [7, 7],
    [7, 23],
    [8, 7],
    [8, 23],
    [9, 8],
    [9, 23],
    [10, 8],
    [10, 24],
    [11, 7],
    [11, 22],
    [12, 7],
    [12, 22],
    [1, 5],
    [1, 20],
  ],
}

const WEEKDAY_TEXT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatDateChinese(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y} 年 ${m} 月 ${d} 日`
}

export function getWeekdayChinese(date: Date) {
  return WEEKDAY_TEXT[date.getDay()] ?? WEEKDAY_TEXT[0]
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface CurrentSolarTermResult {
  term: SolarTermItem
  daysUntilNext: number
}

function toMidnight(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

export function getCurrentSolarTerm(date: Date): CurrentSolarTermResult {
  const year = date.getFullYear()
  const today = new Date(year, date.getMonth(), date.getDate(), 0, 0, 0, 0)

  type Entry = { date: Date; termIndex: number }
  const entries: Entry[] = []

  for (const y of [year - 1, year, year + 1]) {
    const rows = SOLAR_TERM_DATES[y] ?? SOLAR_TERM_DATES[2026]
    rows.forEach(([m, d], i) => {
      const actualYear = i >= 22 ? y + 1 : y
      entries.push({ date: toMidnight(actualYear, m, d), termIndex: i % 24 })
    })
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime())

  let currentIdx = 0
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].date.getTime() <= today.getTime()) {
      currentIdx = i
    } else {
      break
    }
  }

  const current = entries[currentIdx]
  const next = entries[currentIdx + 1] ?? entries[currentIdx]
  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntilNext = Math.round((next.date.getTime() - today.getTime()) / msPerDay)

  return {
    term: SOLAR_TERMS[current.termIndex % SOLAR_TERMS.length],
    daysUntilNext: Math.max(0, daysUntilNext),
  }
}
