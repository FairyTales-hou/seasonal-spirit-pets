import type { CityQuery } from '@/utils/location'

const IS_H5_DEV = import.meta.env.DEV
const GEO_BASE = IS_H5_DEV ? '/qweather-geo/geo' : 'https://geoapi.qweather.com/geo'
const WEATHER_BASE = IS_H5_DEV ? '/qweather-weather' : 'https://devapi.qweather.com'
const QWEATHER_KEY = import.meta.env.VITE_QWEATHER_KEY

interface QWeatherGeoLocation {
  id: string
  name: string
  adm1?: string
  adm2?: string
}

interface QWeatherGeoResponse {
  code: string
  location?: QWeatherGeoLocation[]
}

interface QWeatherNowResponse {
  code: string
  now?: {
    text: string
    temp: string
  }
}

export interface WeatherNow {
  text: string
  temp: string
  cityName: string
}

function request<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      header: {
        'X-QW-Api-Key': QWEATHER_KEY,
      },
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        resolve(res.data as T)
      },
      fail: (err) => reject(new Error(String(err))),
    })
  })
}

function formatCityName(location?: QWeatherGeoLocation, fallbackCityName?: string) {
  if (!location) {
    return fallbackCityName || ''
  }

  const parts = [location.name, location.adm2, location.adm1].filter(Boolean)
  return Array.from(new Set(parts)).join(' · ')
}

function assertKey() {
  if (!QWEATHER_KEY) {
    throw new Error('缺少和风天气 API Key')
  }
}

async function lookupCity(query: CityQuery) {
  assertKey()

  const url = `${GEO_BASE}/v2/city/lookup?location=${encodeURIComponent(query.location)}`
  const result = await request<QWeatherGeoResponse>(url)

  if (result.code !== '200' || !result.location?.length) {
    throw new Error(`QWeather Geo lookup failed: ${result.code}`)
  }

  return result.location[0]
}

export async function getWeatherSummary(query: CityQuery): Promise<WeatherNow> {
  assertKey()

  const city = await lookupCity(query)
  const weatherUrl = `${WEATHER_BASE}/v7/weather/now?location=${encodeURIComponent(city.id)}`
  const result = await request<QWeatherNowResponse>(weatherUrl)

  if (result.code !== '200' || !result.now) {
    throw new Error(`QWeather weather failed: ${result.code}`)
  }

  return {
    text: result.now.text,
    temp: result.now.temp,
    cityName: formatCityName(city, query.fallbackCityName),
  }
}
