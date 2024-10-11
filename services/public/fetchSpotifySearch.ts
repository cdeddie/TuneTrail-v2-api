import { Request }                      from 'express';
import { getClientAccessToken }         from '../../utils/spotifyClientCredentials';
import { globalRateLimiter }            from '../../middleware/rateLimiter';
import { SpotifyArtistSearchResponse }  from '../../types/spotifyArtistSearchResponse';
import { SpotifyTrackSearchResponse }   from '../../types/spotifyTrackSearchResponse';

const fetchSpotifySearch = async (req: Request, ip: string): Promise<{ data: SpotifyArtistSearchResponse | SpotifyTrackSearchResponse; warning?: boolean }> => {
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

    if (type === 'artist') {
      return { data: rawData as SpotifyArtistSearchResponse, warning };
    } else if (type === 'track') {
      return { data: rawData as SpotifyTrackSearchResponse, warning };
    } else {
      throw new Error('Invalid search type');
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifySearch;