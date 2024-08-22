import { Request }              from 'express';
import { getClientAccessToken } from '../../utils/spotifyClientCredentials';
import { globalRateLimiter }    from '../../middleware/rateLimiter';

const fetchSpotifySearch = async (req: Request, ip: string) => {
  const { allowed, warning } = globalRateLimiter.checkLimit(ip);

  if (!allowed) {
    throw new Error('Rate limit exceeded');
  }

  try {
    const { query, type } = req.query;
    const token = await getClientAccessToken();
    
    const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&market=AU&limit=5`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch search [Spotify API] failed with status: ${response.status}`);
    }

    const rawData = await response.json();

    return { data: rawData, warning };
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifySearch;