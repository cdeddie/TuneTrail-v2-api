import { Request }                        from 'express';
import fetchSpotifyRecommendationsPublic  from "../services/public/fetchSpotifyRecommendationsPublic";
import { SpotifyRecommendationResponse }  from "../types/spotifyRecommendationResponse";

describe('publicFetchSpotifyRecommendations Integration Test', () => {
  it('should call Spotify API and return valid SpotifyRecommendationResponse structure', async () => {
    const mockRequest = {
      query: {
        limit: '50',
        tags: '%5B%223DK6m7It6Pw857FcQftMds%22%5D',
        recTargets: '', 
        seedType: 'Track',
      },
    } as unknown as Request;

    const ip = '127.0.0.1';

    try {
      const data = await fetchSpotifyRecommendationsPublic(mockRequest);

      const isValidResponse = (response: SpotifyRecommendationResponse): boolean => {
        return Array.isArray(response.tracks) && Array.isArray(response.seeds);
      };

      expect(isValidResponse(data)).toBe(true);
      expect(data.tracks.length).toEqual(50);

      let totalNull = 0;
      for (let i = 0; i < data.tracks.length; i++) {
        if (data.tracks[i].preview_url == null) {
          totalNull++;
        }
      }
      console.log('Total no of null previews: ', totalNull);

      console.log('Number of tracks:', data.tracks.length);

    } catch (error) {
      console.error('Error during Spotify API call:', error);
      throw error;
    }
  });
});