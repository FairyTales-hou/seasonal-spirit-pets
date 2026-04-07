const IS_H5_DEV = import.meta.env.DEV
const WTTR_BASE = IS_H5_DEV ? '/wttr' : 'https://wttr.in'

const DESC_MAP: Record<string, string> = {
  Sunny: '晴',
  Clear: '晴',
  'Partly cloudy': '多云',
  Cloudy: '阴',
  Overcast: '阴天',
  Mist: '薄雾',
  Fog: '雾',
  'Freezing fog': '冻雾',
  'Light drizzle': '毛毛雨',
  'Freezing drizzle': '冻毛毛雨',
  'Heavy freezing drizzle': '强冻毛毛雨',
  'Light rain': '小雨',
  'Moderate rain': '中雨',
  'Heavy rain': '大雨',
  'Light freezing rain': '小冻雨',
  'Moderate or heavy freezing rain': '冻雨',
  'Light sleet': '小雨夹雪',
  'Moderate or heavy sleet': '雨夹雪',
  'Light snow': '小雪',
  'Moderate snow': '中雪',
  'Heavy snow': '大雪',
  Blizzard: '暴风雪',
  'Patchy rain possible': '局部有雨',
  'Patchy snow possible': '局部有雪',
  'Thundery outbreaks possible': '雷阵雨',
  'Blowing snow': '吹雪',
  'Light rain shower': '阵雨',
  'Moderate or heavy rain shower': '强阵雨',
  'Torrential rain shower': '暴雨',
  'Light sleet showers': '阵雨夹雪',
  'Light snow showers': '阵雪',
  'Moderate or heavy snow showers': '强阵雪',
  'Light showers of ice pellets': '阵冰雹',
  'Moderate or heavy showers of ice pellets': '强冰雹',
  'Patchy light rain with thunder': '雷雨',
  'Moderate or heavy rain with thunder': '强雷雨',
  'Patchy light snow with thunder': '雷雪',
  'Moderate or heavy snow with thunder': '强雷雪',
}

function translateDesc(desc: string): string {
  return DESC_MAP[desc] ?? desc
}

interface WttrResponse {
  current_condition: Array<{
    temp_C: string
    lang_zh: Array<{ value: string }>
    weatherDesc: Array<{ value: string }>
  }>
  nearest_area: Array<{
    areaName: Array<{ value: string }>
    region: Array<{ value: string }>
  }>
}

export interface WeatherNow {
  text: string
  temp: string
  cityName: string
}

export async function getWeatherSummary(query: string): Promise<WeatherNow> {
  const url = `${WTTR_BASE}/${encodeURIComponent(query)}?format=j1`
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        const data = res.data as WttrResponse
        const cond = data?.current_condition?.[0]
        if (!cond) {
          reject(new Error('wttr: 无数据'))
          return
        }
        const area = data?.nearest_area?.[0]
        const cityName = area?.areaName?.[0]?.value || area?.region?.[0]?.value || ''
        resolve({
          text: cond.lang_zh?.[0]?.value || translateDesc(cond.weatherDesc?.[0]?.value ?? ''),
          temp: cond.temp_C,
          cityName,
        })
      },
      fail: (err) => reject(new Error(String(err))),
    })
  })
}
