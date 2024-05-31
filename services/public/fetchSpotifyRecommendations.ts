import { Request } from 'express';
import { getAccessToken } from "../../utils/spotifyClientCredentials";

type SliderItem = {
  name: string;
  value: number[];
};

// https://api.spotify.com/v1/recommendations
// ?limit=50 [we will just have max at 50, and load them 10 at a time on frontend]
// ?seed_artists= OR ?seed_tracks=
// for each recommendationTargets (which will be delivered as a string of all filters seperated by comma, i.e. acousticness=37,energy=100)

const fetchSpotifyRecommendations = async(req: Request) => {
  try {
    const { limit, tags: encodedTags, recTargets: encodedRecTargets, seedType } = req.query;

    const tags = decodeURIComponent(encodedTags as string);
    const recommendationString = decodeURIComponent(encodedRecTargets as string);
    const seedKey = seedType === 'artist' ? 'seed_artists' : 'seed_tracks';
    const token = await getAccessToken();

    let queryParams = new URLSearchParams([
      ["limit", limit as string],
      [seedKey, tags]
    ]);
    
    const recommendationPairs = recommendationString.split(',');
    recommendationPairs.map(pair => {
      const [word, number] = pair.split('=');
      if (number) queryParams.append(`target_${word}`, number);
    });

    // example url: https://api.spotify.com/v1/recommendations?limit=25&seed_artists=5K4W6rqBFWDnAN6FQUkS6x&target_energy=40 - %2C represents ,
    const url = `https://api.spotify.com/v1/recommendations?${queryParams}`;
    console.log(url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch recommendations [Spotify API] failed with status: ${response.status}`);
    }

    const rawData = await response.json();
    return rawData;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifyRecommendations;