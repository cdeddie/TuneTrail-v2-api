import { Request}                         from 'express';

const fetchSpotifyRecommendationsPrivate = async(req: Request): Promise<SpotifyApi.RecommendationsObject> => {
  try {
    if (!req.session.is_logged_in) {
      throw new Error('User must be logged in');
    }

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

    const recommendations: SpotifyApi.RecommendationsObject = await response.json();

    // let totalNull = 0;
    // for (let i = 0; i < recommendations.tracks.length; i++) {
    //   if (recommendations.tracks[i].preview_url === null || recommendations.tracks[i].preview_url === undefined) {
    //     totalNull++;
    //   }
    // }
    // console.log('Total no of null previews private: ', totalNull);

    return recommendations;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export default fetchSpotifyRecommendationsPrivate;