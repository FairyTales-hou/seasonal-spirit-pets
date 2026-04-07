import { SOLAR_TERMS } from '@/constants/solar-terms'
import type { SolarTermItem } from '@/constants/solar-terms'

// 2025-2027 节气精确日期表（UTC+8，每年 24 个节气按序排列）
// 格式：[月(1-based), 日]
const SOLAR_TERM_DATES: Record<number, [number, number][]> = {
  2025: [
    [2, 3],  // 立春
    [2, 18], // 雨水
    [3, 5],  // 惊蛰
    [3, 20], // 春分
    [4, 4],  // 清明
    [4, 20], // 谷雨
    [5, 5],  // 立夏
    [5, 21], // 小满
    [6, 5],  // 芒种
    [6, 21], // 夏至
    [7, 7],  // 小暑
    [7, 22], // 大暑
    [8, 7],  // 立秋
    [8, 23], // 处暑
    [9, 7],  // 白露
    [9, 23], // 秋分
    [10, 8], // 寒露
    [10, 23],// 霜降
    [11, 7], // 立冬
    [11, 22],// 小雪
    [12, 7], // 大雪
    [12, 22],// 冬至
    [1, 5],  // 小寒（跨年，实为2026-01-05）
    [1, 20], // 大寒（跨年，实为2026-01-20）
  ],
  2026: [
    [2, 4],  // 立春
    [2, 18], // 雨水
    [3, 5],  // 惊蛰
    [3, 20], // 春分
    [4, 5],  // 清明
    [4, 20], // 谷雨
    [5, 5],  // 立夏
    [5, 21], // 小满
    [6, 6],  // 芒种
    [6, 21], // 夏至
    [7, 7],  // 小暑
    [7, 23], // 大暑
    [8, 7],  // 立秋
    [8, 23], // 处暑
    [9, 8],  // 白露
    [9, 23], // 秋分
    [10, 8], // 寒露
    [10, 23],// 霜降
    [11, 7], // 立冬
    [11, 22],// 小雪
    [12, 7], // 大雪
    [12, 22],// 冬至
    [1, 5],  // 小寒（跨年，实为2027-01-05）
    [1, 20], // 大寒（跨年，实为2027-01-20）
  ],
  2027: [
    [2, 3],  // 立春
    [2, 18], // 雨水
    [3, 6],  // 惊蛰
    [3, 21], // 春分
    [4, 5],  // 清明
    [4, 20], // 谷雨
    [5, 6],  // 立夏
    [5, 21], // 小满
    [6, 6],  // 芒种
    [6, 21], // 夏至
    [7, 7],  // 小暑
    [7, 23], // 大暑
    [8, 7],  // 立秋
    [8, 23], // 处暑
    [9, 8],  // 白露
    [9, 23], // 秋分
    [10, 8], // 寒露
    [10, 24],// 霜降
    [11, 7], // 立冬
    [11, 22],// 小雪
    [12, 7], // 大雪
    [12, 22],// 冬至
    [1, 5],  // 小寒（跨年，实为2028-01-05）
    [1, 20], // 大寒（跨年，实为2028-01-20）
  ],
}

export function formatDateChinese(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y} 年 ${m} 月 ${d} 日`
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

  // Build a flat list of {date, termIndex} covering prev-year tail + this year + next-year head
  // so we handle year boundaries correctly
  type Entry = { date: Date; termIndex: number }
  const entries: Entry[] = []

  for (const y of [year - 1, year, year + 1]) {
    const rows = SOLAR_TERM_DATES[y] ?? SOLAR_TERM_DATES[2026]
    rows.forEach(([m, d], i) => {
      // The last two entries (indices 22, 23) are actually the NEXT calendar year
      const actualYear = i >= 22 ? y + 1 : y
      entries.push({ date: toMidnight(actualYear, m, d), termIndex: i % 24 })
    })
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Find the most recent term that has already started
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
