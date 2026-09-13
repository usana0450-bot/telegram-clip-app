export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url, start, duration } = req.body;
  if (!url) return res.status(400).json({ status: 'error', message: 'URL is required' });

  try {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) return res.status(400).json({ status: 'error', message: 'Invalid YouTube URL' });

    // Correct backend endpoint for Spicy-Laika RapidAPI
    const apiUrl = `https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_video/${videoId}?trim_start_time=${start || 0}&trim_duration=${duration || 30}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '4965da4cbdmsh0e3ddac85eab025p126084jsn016392779795',
        'X-RapidAPI-Host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
      }
    });

    const data = await response.json();
    const downloadUrl = data.file || data.downloadUrl || data.download_url || data.url || data.link;

    if (downloadUrl) {
      return res.status(200).json({ status: 'success', download_url: downloadUrl });
    } else {
      return res.status(500).json({ status: 'error', message: data.comment || data.message || 'Download link not generated' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
