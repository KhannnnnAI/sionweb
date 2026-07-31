const functions = require('firebase-functions');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Bật CORS cho tất cả request
app.use(cors({ origin: true }));

// ==========================================================================
//   SOUNDCLOUD CLIENT_ID AUTO-SCRAPER
// ==========================================================================

let cachedClientId = null;
let lastFetchedTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 12; // Refresh key mỗi 12 tiếng

/**
 * Hàm tự động bóc tách client_id sống từ SoundCloud
 */
async function getLiveClientId() {
  const now = Date.now();
  if (cachedClientId && (now - lastFetchedTime < CACHE_DURATION)) {
    return cachedClientId;
  }

  try {
    const homeResponse = await axios.get('https://soundcloud.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const scriptMatches = homeResponse.data.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[a-zA-Z0-9-]+\.js/g);
    
    if (!scriptMatches || scriptMatches.length === 0) {
      throw new Error('Không tìm thấy file JS assets');
    }

    const targetScripts = scriptMatches.slice(-3);
    
    for (const scriptUrl of targetScripts) {
      const scriptResponse = await axios.get(scriptUrl);
      const match = scriptResponse.data.match(/client_id[:=]"([a-zA-Z0-9]{32})"/);
      
      if (match && match[1]) {
        cachedClientId = match[1];
        lastFetchedTime = now;
        return cachedClientId;
      }
    }
  } catch (error) {
    console.error('Lỗi khi tự động lấy client_id:', error.message);
  }

  return cachedClientId || 'X2iyLRaFdot6PHiU6l7tTR8wRSTY0sFp'; 
}

// ==========================================================================
//   API ROUTE: /api/soundcloud-profile
// ==========================================================================

const CACHE_TTL = 5 * 60 * 1000; // 5 phút
let profileCache = null;

app.get('/api/soundcloud-profile', async (req, res) => {
  try {
    if (profileCache && (Date.now() - profileCache.timestamp) < CACHE_TTL) {
      return res.status(200).json(profileCache.data);
    }

    const profileUrl = req.query.url || 'https://soundcloud.com/sionnnoke';
    const clientId = await getLiveClientId();

    const resolveUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(profileUrl)}&client_id=${clientId}`;
    const userRes = await axios.get(resolveUrl);
    const userData = userRes.data;

    const tracksUrl = `https://api-v2.soundcloud.com/users/${userData.id}/tracks?limit=20&client_id=${clientId}`;
    const tracksRes = await axios.get(tracksUrl);

    let playlistTracks = [];
    try {
      const playlistsUrl = `https://api-v2.soundcloud.com/users/${userData.id}/playlists?limit=10&client_id=${clientId}`;
      const playlistsRes = await axios.get(playlistsUrl);
      const playlists = playlistsRes.data.collection || [];
      for (const pl of playlists) {
        if (pl.tracks && pl.tracks.length > 0) {
          playlistTracks = playlistTracks.concat(pl.tracks);
        }
      }
    } catch (plErr) {
      console.log('Không lấy được playlists:', plErr.message);
    }

    const allRawTracks = [...(tracksRes.data.collection || []), ...playlistTracks];
    const seen = new Set();
    const uniqueTracks = allRawTracks.filter(track => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    });

    uniqueTracks.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    const responseData = {
      userId: userData.id,
      username: userData.username,
      avatar: userData.avatar_url ? userData.avatar_url.replace('-large', '-t300x300') : '',
      followers: userData.followers_count || 0,
      trackCount: userData.track_count || 0,
      profileUrl: userData.permalink_url,
      tracks: uniqueTracks.map(track => ({
        id: track.id,
        title: track.title,
        artwork: track.artwork_url ? track.artwork_url.replace('-large', '-t200x200') : '',
        plays: track.playback_count || 0,
        likes: track.likes_count || 0,
        url: track.permalink_url,
        duration: track.duration || 0
      }))
    };

    profileCache = { data: responseData, timestamp: Date.now() };

    return res.status(200).json(responseData);

  } catch (err) {
    console.error('API Error:', err.message);
    if (profileCache) {
      return res.status(200).json(profileCache.data);
    }
    return res.status(500).json({ error: 'Không thể lấy dữ liệu SoundCloud Profile' });
  }
});

// Xuất ra Firebase Functions
exports.api = functions.https.onRequest(app);

// Chạy server trực tiếp nếu dùng Cloud Run (node index.js)
if (require.main === module) {
  const port = parseInt(process.env.PORT) || 8080;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại port ${port}`);
  });
}
