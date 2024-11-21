import { getClientAccessToken } from '../../utils/spotifyClientCredentials';

const fetchPlaylistTracks = async (playlistId: string) => {
  try {
    const token: string = await getClientAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch playlist tracks failed with status: ${response.status} (${response.statusText})`);
    }

    const data: SpotifyApi.PlaylistTrackResponse = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default fetchPlaylistTracks;