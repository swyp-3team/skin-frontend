export default async function handler(req, res) {
  // /api/... → https://api.layerd.co.kr/api/...
  const path = req.url.replace(/^\/api/, '')
  const targetUrl = `https://api.layerd.co.kr/api${path}`

  // 요청 헤더 복사 (host 제외)
  const headers = {}
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value
    }
  }
  // vite proxy와 동일하게 origin을 백엔드 도메인으로 교체
  headers['origin'] = 'https://api.layerd.co.kr'

  const init = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = JSON.stringify(req.body)
  }

  const upstream = await fetch(targetUrl, init)
  const body = await upstream.arrayBuffer()

  res.status(upstream.status)
  upstream.headers.forEach((value, key) => {
    if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
      res.setHeader(key, value)
    }
  })
  res.send(Buffer.from(body))
}
