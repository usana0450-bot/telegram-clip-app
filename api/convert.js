export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ status: 'error', message: 'URL is required' });

  try {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) return res.status(400).json({ status: 'error', message: 'Invalid YouTube URL' });

    // Defined 5 Viral Hook Timestamps (Start Time & Title)
    const hookSegments = [
      { id: 1, title: "🔥 Viral Hook #1 (Opening Catch)", start: 10, duration: 30 },
      { id: 2, title: "🚀 High Energy Moment #2", start: 60, duration: 30 },
      { id: 3, title: "💡 Main Insight / Highlight #3", start: 120, duration: 30 },
      { id: 4, title: "💥 Best Reaction Clip #4", start: 180, duration: 30 },
      { id: 5, title: "⚡ Climax / Outro Hook #5", start: 240, duration: 30 }
    ];

    // Fetch download URLs for all 5 clips simultaneously
    const clipPromises = hookSegments.map(async (hook) => {
      const apiUrl = `https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_video/${videoId}?trim_start_time=${hook.start}&trim_duration=${hook.duration}`;
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '4965da4cbdmsh0e3ddac85eab025p126084jsn016392779795',
            'X-RapidAPI-Host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
          }
        });
        const data = await response.json();
        const downloadUrl = data.file || data.downloadUrl || data.download_url || data.url || data.link;
        return { ...hook, videoUrl: downloadUrl || null };
      } catch (e) {
        return { ...hook, videoUrl: null };
      }
    });

    const clips = await Promise.all(clipPromises);
    const validClips = clips.filter(c => c.videoUrl !== null);

    if (validClips.length > 0) {
      return res.status(200).json({ status: 'success', clips: validClips });
    } else {
      return res.status(500).json({ status: 'error', message: 'Failed to extract viral clips' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
