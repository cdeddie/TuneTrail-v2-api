import { Request }                        from 'express';
import fetchSpotifyRecommendationsPublic  from "../services/public/fetchSpotifyRecommendationsPublic";

describe('publicFetchSpotifyRecommendations Integration Test', () => {
  it('should call Spotify API and return valid SpotifyApi.RecommendationsObject structure with correct number of track', async () => {
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

      const isValidResponse = (response: SpotifyApi.RecommendationsObject): boolean => {
        return Array.isArray(response.tracks) && Array.isArray(response.seeds);
      };

      expect(isValidResponse(data)).toBe(true);
      expect(data.tracks.length).toEqual(50);
    } catch (error) {
      console.error('Error during Spotify API call:', error);
      throw error;
    }
  });

  it('should return filtered recommendations based on recommendation targets (popularity)', async () => {
    const mockRequest = {
      query: {
        limit: '50',
        tags: '%5B%227KHQtpLpoIV3Wfu22YQT8y%22%5D',
        recTargets: 'target_popularity=0',
        seedType: 'Track',
      },
    } as unknown as Request;
  
    const data = await fetchSpotifyRecommendationsPublic(mockRequest);

    const averagePopularity = data.tracks.reduce((sum, track) => sum + track.popularity, 0) / data.tracks.length;
    const isPopularityInRange = averagePopularity >= 0 && averagePopularity <= 40;
    expect(isPopularityInRange).toBe(true);
  });
  
  it('should throw an error if tags are missing', async () => {
    const mockRequest = {
      query: {
        limit: '10',
        tags: '',
        recTargets: '',
        seedType: 'Track',
      },
    } as unknown as Request;
  
    await expect(fetchSpotifyRecommendationsPublic(mockRequest)).rejects.toThrow(
      'Fetch recommendations [Spotify API] failed'
    );
  });
});