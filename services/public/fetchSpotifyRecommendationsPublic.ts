import { Request }                        from 'express';
import { getClientAccessToken }           from "../../utils/spotifyClientCredentials";
import { SpotifyRecommendationResponse }  from '../../types/spotifyRecommendationResponse';

// https://api.spotify.com/v1/recommendations
// ?limit=50 [we will just have max at 50, and load them 10 at a time on frontend]
// ?seed_artists= OR ?seed_tracks=
// for each recommendationTargets (which will be delivered as a string of all filters seperated by comma, i.e. acousticness=37,energy=100)

const fetchSpotifyRecommendationsPublic = async(req: Request): Promise<SpotifyRecommendationResponse> => {
  try {
    // Limit is no. songs
    const { limit, tags: encodedTags, recTargets: encodedRecTargets, seedType } = req.query;

    const tags = decodeURIComponent(encodedTags as string);
    const recommendationString = decodeURIComponent(encodedRecTargets as string);
    const seedKey = seedType === 'Artist' ? 'seed_artists' : 'seed_tracks';
    const token = await getClientAccessToken();

    const formattedTags = tags.replace(/[\[\]"]/g, '').split(',').join('%2C');

    let queryParams = `limit=${encodeURIComponent(limit as string)}&${seedKey}=${formattedTags}`;

    const recommendationPairs = recommendationString.split(',');
    recommendationPairs.forEach(pair => {
      const [word, number] = pair.split('=');
      if (number) queryParams += `&${word}=${encodeURIComponent(number)}`;
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

    const data = await response.json();

    // We're looking into this very strongly
    data.tracks = data.tracks.map((track: any) => {
      const { album, available_markets, ...restOfTrack } = track;
      const { available_markets: albumMarkets, ...restOfAlbum } = album;
      return {
        ...restOfTrack,
        album: restOfAlbum
      };
    });

    // let totalNull = 0;
    // for (let i = 0; i < data.tracks.length; i++) {
    //   if (!data.tracks[i].preview_url) {
    //     totalNull++;
    //   }
    // }
    // console.log('Total no of null previews: ', totalNull, 'Total no of tracks: ', data.tracks.length);

    // let averagePopularity = 0;
    // for (let i = 0; i < data.tracks.length; i++) {
    //   averagePopularity += data.tracks[i].popularity;
    // }
    // averagePopularity /= data.tracks.length;
    // // console.log('Avg popularity: ', averagePopularity);

    return data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifyRecommendationsPublic;