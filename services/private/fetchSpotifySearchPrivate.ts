import { Request } from 'express';

const fetchSpotifySearchPrivate = async(req: Request): Promise<SpotifyApi.ArtistSearchResponse | SpotifyApi.TrackSearchResponse> => {
  try {
    const { query, type } = req.query;
    const token = req.session.access_token;
    
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
      return rawData as SpotifyApi.ArtistSearchResponse;
    } else if (type === 'track') {
      return rawData as SpotifyApi.TrackSearchResponse;
    } else {
      throw new Error('Invalid search type');
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifySearchPrivate;