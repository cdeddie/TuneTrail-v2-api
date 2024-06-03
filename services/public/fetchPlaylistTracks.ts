import { getAccessToken } from '../../utils/spotifyClientCredentials';

const fetchPlaylistTracks = async (playlistId: string) => {
  try {
    const token: string = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch playlist tracks failed with status: ${response.status}`);
    }

    const data = await response.json();

    // We're looking into this very strongly
    data.items = data.items.map((item: any) => {
      const { track, ...restOfItem } = item;
      const { album, available_markets, ...restOfTrack } = track;
      const { available_markets: albumMarkets, ...restOfAlbum } = album;
      return {
        ...restOfItem,
        track: {
          ...restOfTrack,
          album: restOfAlbum
        }
      };
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export default fetchPlaylistTracks;