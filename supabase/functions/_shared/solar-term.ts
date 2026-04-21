const SOLAR_TERM_NAMES = [
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
  '冬至',
  '小寒',
  '大寒',
] as const

// UTC+8 day list, same source as frontend date util.
const SOLAR_TERM_DATES: Record<number, [number, number][]> = {
  2025: [
    [2, 3], [2, 18], [3, 5], [3, 20], [4, 4], [4, 20], [5, 5], [5, 21], [6, 5], [6, 21], [7, 7], [7, 22],
    [8, 7], [8, 23], [9, 7], [9, 23], [10, 8], [10, 23], [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20],
  ],
  2026: [
    [2, 4], [2, 18], [3, 5], [3, 20], [4, 5], [4, 20], [5, 5], [5, 21], [6, 6], [6, 21], [7, 7], [7, 23],
    [8, 7], [8, 23], [9, 8], [9, 23], [10, 8], [10, 23], [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20],
  ],
  2027: [
    [2, 3], [2, 18], [3, 6], [3, 21], [4, 5], [4, 20], [5, 6], [5, 21], [6, 6], [6, 21], [7, 7], [7, 23],
    [8, 7], [8, 23], [9, 8], [9, 23], [10, 8], [10, 24], [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20],
  ],
}

export function getSolarTermNameByDate(dateKey: string) {
  const [yearText, monthText, dayText] = dateKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  if (!year || !month || !day) {
    return null
  }

  const rows = SOLAR_TERM_DATES[year]
  if (!rows) {
    return null
  }

  const index = rows.findIndex(([m, d]) => m === month && d === day)
  if (index < 0) {
    return null
  }

  return SOLAR_TERM_NAMES[index] ?? null
}
