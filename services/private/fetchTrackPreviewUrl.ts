import { Request } from 'express';

type TrackPreview = {
  id: string;
  url: string;
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

    const data = await response.json();
    const previews: TrackPreview[] = [];

    for (let i = 0; i < data.tracks.length; i++) {
      const preview: TrackPreview = {
        id: data.tracks[i].id,
        url: data.tracks[i].preview_url,
      }
      previews.push(preview);
    }

    return previews;

  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchTrackPreviewUrl;