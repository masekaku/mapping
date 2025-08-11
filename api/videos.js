export default async function handler(req, res) {
  try {
    const apiKey = process.env.DOOD_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'DOOD_API_KEY not set in environment' });
    }

    const page = req.query.page || 1;
    const per_page = req.query.per_page || 10;
    const doodURL = `https://doodapi.com/api/file/list?key=${apiKey}&page=${page}&per_page=${per_page}`;

    const response = await fetch(doodURL);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}