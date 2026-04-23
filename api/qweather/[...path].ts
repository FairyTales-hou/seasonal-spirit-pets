export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'X-QW-Api-Key,Content-Type')
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ code: 405, message: 'method_not_allowed' })
    return
  }

  const key = process.env.QWEATHER_KEY?.trim() || process.env.VITE_QWEATHER_KEY?.trim() || ''
  if (!key) {
    res.status(500).json({ code: 500, message: 'missing_qweather_key' })
    return
  }

  const pathParam = req.query.path
  const pathParts = Array.isArray(pathParam) ? pathParam : typeof pathParam === 'string' ? [pathParam] : []
  const [group, ...rest] = pathParts

  let origin = ''
  if (group === 'geo') {
    origin = 'https://mf3wt3a8u8.re.qweatherapi.com'
  } else if (group === 'weather') {
    origin = 'https://mf3wt3a8u8.re.qweatherapi.com'
  } else {
    res.status(404).json({ code: 404, message: 'unknown_qweather_group' })
    return
  }

  const search = typeof req.url === 'string' && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  const target = `${origin}/${group}/${rest.join('/')}${search}`

  try {
    const upstream = await fetch(target, {
      headers: {
        'X-QW-Api-Key': key,
      },
    })

    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
    res.send(body)
  } catch (error) {
    res.status(502).json({
      code: 502,
      message: error instanceof Error ? error.message : 'qweather_proxy_failed',
    })
  }
}
