export default async function handler(req, res) {
  const { page = 1, per_page = 50 } = req.query;

  // API Key simpan di Environment Variables Vercel (Settings → Environment Variables)
  const DOOD_KEY = process.env.DOOD_KEY;

  try {
    const apiUrl = `https://doodapi.com/api/file/list?key=${DOOD_KEY}&page=${page}&per_page=${per_page}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil data video' });
  }
}