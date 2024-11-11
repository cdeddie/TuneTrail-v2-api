import { Request } from 'express';
import { Track }    from '../../types/spotifyCommonTypes';

type TrackPreview = {
  id: string;
  url: string;
}

type SpotifyTracksReturn = {
  tracks: Track[];
}

const fetchTrackPreviewUrl = async (req: Request, trackIdList: string[]): Promise<TrackPreview[]> => {
  try {
    const idListEncoded = encodeURIComponent(trackIdList.join(','));
    const url = `https://api.spotify.com/v1/tracks?ids=${idListEncoded}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch recommendations [Spotify API] failed with status: ${response.status}`);
    }

    const data: SpotifyTracksReturn = await response.json();
    console.log('No of songs retrieved from /tracks', data.tracks.length);
    const previews: TrackPreview[] = [];

    for (let i = 0; i < data.tracks.length; i++) {
      const curr = data.tracks[i];
      if (curr.preview_url && curr.preview_url !== '' && curr.preview_url !== undefined) {
        const preview: TrackPreview = {
          id: curr.id,
          url: curr.preview_url,
        }
        console.log(preview);
        previews.push(preview);
      }
    }

    return previews;

  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchTrackPreviewUrl;