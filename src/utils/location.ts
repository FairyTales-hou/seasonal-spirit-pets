const DEFAULT_CITY = '郑州'

export interface CityQuery {
  location: string
  fallbackCityName: string
}

export function getCity(lastCity?: string): Promise<CityQuery> {
  const fallbackCityName = lastCity || DEFAULT_CITY

  const formatCoord = (value: number) => Number(value.toFixed(2)).toString()

  return new Promise((resolve) => {
    uni.getLocation({
      type: 'wgs84',
      success: (res) => {
        resolve({
          location: `${formatCoord(res.longitude)},${formatCoord(res.latitude)}`,
          fallbackCityName,
        })
      },
      fail: () => {
        resolve({
          location: fallbackCityName,
          fallbackCityName,
        })
      },
    })
  })
}
