import fetch from "node-fetch";

export default async function handler(req, res) {
  const page = req.query.page || 1;
  const per_page = req.query.per_page || 10;
  const DOOD_KEY = process.env.DOOD_KEY;

  // Debug 1: Cek kalau API Key ada
  if (!DOOD_KEY) {
    return res.status(500).json({
      error: "API Key tidak ditemukan",
      note: "Pastikan DOOD_KEY ada di Environment Variables Vercel (Production & Preview) lalu redeploy."
    });
  }

  // Debug 2: Cek URL yang dipanggil
  const apiUrl = `https://doodapi.com/api/file/list?key=${DOOD_KEY}&page=${page}&per_page=${per_page}`;

  try {
    const response = await fetch(apiUrl);

    // Debug 3: Kalau response status bukan 200, return error
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Request ke Doodstream gagal",
        status: response.status,
        statusText: response.statusText,
        url: apiUrl
      });
    }

    // Debug 4: Ambil data mentah buat lihat isinya
    const text = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch (e) {
      jsonData = { raw: text };
    }

    return res.status(200).json({
      sourceUrl: apiUrl,
      doodstreamResponse: jsonData
    });

  } catch (err) {
    return res.status(500).json({
      error: "Gagal fetch data",
      detail: err.message,
      attemptedUrl: apiUrl
    });
  }
}