import { Request}                         from 'express';
import fetchTrackPreviewUrl               from './fetchTrackPreviewUrl';
import { SpotifyRecommendationResponse }  from '../../types/spotifyRecommendationResponse';

const fetchSpotifyRecommendationsPrivate = async(req: Request): Promise<SpotifyRecommendationResponse> => {
  try {
    const { limit, tags: encodedTags, recTargets: encodedRecTargets, seedType } = req.query;

    const tags = decodeURIComponent(encodedTags as string);
    const recommendationString = decodeURIComponent(encodedRecTargets as string);
    const seedKey = seedType === 'Artist' ? 'seed_artists' : 'seed_tracks';
    const token = req.session.access_token;

    const formattedTags = tags.replace(/[\[\]"]/g, '').split(',').join('%2C');

    let queryParams = `limit=${encodeURIComponent(limit as string)}&${seedKey}=${formattedTags}`;

    const recommendationPairs = recommendationString.split(',');
    recommendationPairs.forEach(pair => {
      const [word, number] = pair.split('=');
      if (number) queryParams += `&target_${word}=${encodeURIComponent(number)}`;
    });

    // example url: https://api.spotify.com/v1/recommendations?limit=25&seed_artists=5K4W6rqBFWDnAN6FQUkS6x&target_energy=40 - %2C represents ,
    const url = `https://api.spotify.com/v1/recommendations?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch recommendations [Spotify API] failed with status: ${response.status}`);
    }

    // Loop over each track, if preview_url === null, then perform further api calls.
    const recommendations = await response.json();

    const trackIds: string[] = [];
    for (let i = 0; i < recommendations.tracks.length; i++) {
      const track = recommendations.tracks[i];
      if (track.preview_url === null) {
        trackIds.push(track.id);
      }
    }

    const missingPreviews = await fetchTrackPreviewUrl(req, trackIds);
    let previewIndex = 0;

    // We're looking into this very strongly
    recommendations.tracks = recommendations.tracks.map((track: any) => {
      const { album, available_markets, ...restOfTrack } = track;
      const { available_markets: albumMarkets, ...restOfAlbum } = album;
      return {
        ...restOfTrack,
        album: restOfAlbum
      };
    });

    // Replacing null with missing preview
    for (let i = 0; i < recommendations.tracks.length; i++) {
      const track = recommendations.tracks[i];
      if (track.preview_url === null && track.id === missingPreviews[previewIndex].id) {
        track.preview_url = missingPreviews[previewIndex].url;
        previewIndex++;
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifyRecommendationsPrivate;