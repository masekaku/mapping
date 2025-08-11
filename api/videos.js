import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { page = 1, per_page = 50 } = req.query;
  const DOOD_KEY = process.env.DOOD_KEY;

  if (!DOOD_KEY) {
    return res.status(500).json({
      error: 'API Key tidak ditemukan di environment variables Vercel',
      hint: 'Pastikan nama variabelnya DOOD_KEY dan di-set di Production + Preview'
    });
  }

  try {
    const apiUrl = `https://doodapi.com/api/file/list?key=${DOOD_KEY}&page=${page}&per_page=${per_page}`;
    const response = await fetch(apiUrl);
    const text = await response.text(); // ambil raw text biar bisa lihat error aslinya

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil data video', detail: error.message });
  }
}