import { Request }                        from 'express';
import fetchSpotifyRecommendationsPublic  from "../services/public/fetchSpotifyRecommendationsPublic";
import { SpotifyRecommendationResponse }  from "../types/spotifyRecommendationResponse";

describe('publicFetchSpotifyRecommendations Integration Test', () => {
  it('should call Spotify API and return valid SpotifyRecommendationResponse structure', async () => {
    const mockRequest = {
      query: {
        limit: '50',
        tags: '%5B%223f3HHRPF5vAo90GwdpDMaQ%22%5D',
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

      console.log('Number of tracks:', data.tracks.length);
      console.log('Seeds:', data.seeds);

    } catch (error) {
      console.error('Error during Spotify API call:', error);
      throw error;
    }
  });
});