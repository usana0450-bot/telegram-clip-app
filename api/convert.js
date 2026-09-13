export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, start, duration } = req.body;

  if (!url) {
    return res.status(400).json({ status: 'error', message: 'URL is required' });
  }

  try {
    // Calling RapidAPI / Cloud Trimmer Engine
    const response = await fetch('https://youtube-video-trimmer.p.rapidapi.com/trim', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY_HERE', // RapidAPI Key enter yahan hogi
        'X-RapidAPI-Host': 'youtube-video-trimmer.p.rapidapi.com'
      },
      body: JSON.stringify({ url, start, duration })
    });

    const data = await response.json();

    return res.status(200).json({
      status: 'success',
      download_url: data.download_url || url
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
