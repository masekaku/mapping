// api/videos.js
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  // dynamic import node-fetch only if needed
  fetchFn = (await import('node-fetch')).default;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    const apiKey = process.env.DOOD_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'DOOD_API_KEY not set in environment' });
    }

    const page = Math.max(1, parseInt(req.query.page || 1, 10));
    const per_page = Math.min(100, Math.max(1, parseInt(req.query.per_page || 10, 10)));

    const doodURL = `https://doodapi.com/api/file/list?key=${encodeURIComponent(apiKey)}&page=${page}&per_page=${per_page}`;

    const response = await fetchFn(doodURL);
    if (!response.ok) {
      let bodyText = null;
      try { bodyText = await response.text(); } catch {}
      return res.status(response.status).json({
        error: 'Doodstream API error',
        status: response.status,
        statusText: response.statusText,
        body: bodyText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({ error: error?.message || 'Unknown error' });
  }
}