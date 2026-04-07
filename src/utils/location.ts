const DEFAULT_CITY = '郑州'

export function getCity(lastCity?: string): Promise<string> {
  return new Promise((resolve) => {
    uni.getLocation({
      type: 'wgs84',
      success: (res) => {
        // wttr.in uses "lat,lon" format
        resolve(`${res.latitude},${res.longitude}`)
      },
      fail: () => {
        resolve(lastCity || DEFAULT_CITY)
      },
    })
  })
}
