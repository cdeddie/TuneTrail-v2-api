import { Request }                        from 'express';
import { getClientAccessToken }           from '../utils/spotifyClientCredentials';
import fetchSpotifyRecommendationsPrivate from '../services/private/fetchSpotifyRecommendationsPrivate';

describe('privateFetchSpotifyRecommendations Integration Test', () => {
  it('should check if each track has a valid preview_url', async () => {
    const accessToken = await getClientAccessToken();
    const mockRequest = {
      query: {
        limit: '100',
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

      expect(data.tracks.length).toEqual(100);
      console.log('Number of returned tracks: ', data.tracks.length);

      // Check if each track has a preview_url, and if it exists, ensure it's not an empty string
      let missingPreviewUrls = 0;
      data.tracks.forEach(track => {
        if (track.preview_url) {
          expect(track.preview_url).not.toEqual('');
        } else if (!track.preview_url) {
          missingPreviewUrls++;
        }
      });

      expect(missingPreviewUrls).toEqual(0);

    } catch (error) {
      console.error('Error during Spotify API call:', error);
      throw error;
    }
  });
});
