import fetch from "node-fetch";

export default async function handler(req, res) {
  const DOOD_KEY = process.env.DOOD_KEY;
  if (!DOOD_KEY) {
    return res.status(500).json({
      error: "API Key tidak ditemukan",
      hint: "Set environment variable DOOD_KEY di Vercel Settings"
    });
  }

  const page = req.query.page || 1;
  const per_page = req.query.per_page || 10;
  const apiUrl = `https://doodapi.com/api/file/list?key=${DOOD_KEY}&page=${page}&per_page=${per_page}`;

  try {
    const r = await fetch(apiUrl);
    if (!r.ok) {
      return res.status(r.status).json({ error: "Request ke Doodstream gagal", statusText: r.statusText });
    }
    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data", detail: err.message });
  }
}