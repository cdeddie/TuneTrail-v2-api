import { Request }                        from 'express';
import { getClientAccessToken }           from '../utils/spotifyClientCredentials';
import fetchSpotifyRecommendationsPrivate from '../services/private/fetchSpotifyRecommendationsPrivate';

describe('privateFetchSpotifyRecommendations Integration Test', () => {
  it('should check if each track has a valid preview_url', async () => {
    const accessToken = await getClientAccessToken();
    const mockRequest = {
      query: {
        limit: '25',
        tags: '%5B%223f3HHRPF5vAo90GwdpDMaQ%22%5D',
        recTargets: '',
        seedType: 'Track',
      },
      session: {
        access_token: accessToken,
      },
    } as unknown as Request;

    const ip = '127.0.0.1';

    try {
      const data = await fetchSpotifyRecommendationsPrivate(mockRequest);

      expect(data.tracks.length).toEqual(25);
    } catch (error) {
      console.error('Error during Spotify API call:', error);
      throw error;
    }
  });
});
