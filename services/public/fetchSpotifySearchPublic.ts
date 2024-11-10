import { Request }                      from 'express';
import { getClientAccessToken }         from '../../utils/spotifyClientCredentials';
import { SpotifyArtistSearchResponse }  from '../../types/spotifyArtistSearchResponse';
import { SpotifyTrackSearchResponse }   from '../../types/spotifyTrackSearchResponse';

const fetchSpotifySearchPublic = async (req: Request): Promise<SpotifyArtistSearchResponse | SpotifyTrackSearchResponse> => {
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
      return rawData as SpotifyArtistSearchResponse;
    } else if (type === 'track') {
      return rawData as SpotifyTrackSearchResponse;
    } else {
      throw new Error('Invalid search type');
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifySearchPublic;