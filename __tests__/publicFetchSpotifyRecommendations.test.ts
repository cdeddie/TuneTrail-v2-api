import { Request }                        from 'express';
import fetchSpotifyRecommendations        from "../services/public/fetchSpotifyRecommendations";
import { SpotifyRecommendationResponse }  from "../types/spotifyRecommendationResponse";

describe('publicFetchSpotifyRecommendations Integration Test', () => {
  it('should call Spotify API and return valid SpotifyRecommendationResponse structure', async () => {
    const mockRequest = {
      query: {
        limit: '10',
        tags: '%5B%223f3HHRPF5vAo90GwdpDMaQ%22%5D',
        recTargets: '', 
        seedType: 'Track',
      },
    } as unknown as Request;

    const ip = '127.0.0.1';

    try {
      const { data, warning } = await fetchSpotifyRecommendations(mockRequest, ip);

      const isValidResponse = (response: SpotifyRecommendationResponse): boolean => {
        return Array.isArray(response.tracks) && Array.isArray(response.seeds);
      };

      expect(isValidResponse(data)).toBe(true);
      expect(data.tracks.length).toEqual(10);
      expect(warning).toBe(false);

      console.log('Number of tracks:', data.tracks.length);
      console.log('Seeds:', data.seeds);

    } catch (error) {
      console.error('Error during Spotify API call:', error);
      throw error;
    }
  });
});