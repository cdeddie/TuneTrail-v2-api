import { Request } from 'express';

const checkUserSavedTracks = async (req: Request, ids: Array<string>): Promise<Array<boolean>> => {
  try {
    if (!req.session.is_logged_in) {
      throw new Error('User must be logged in');
    }

    const queryParams = new URLSearchParams({ ids: ids.join(',') }).toString();
    const url = `https://api.spotify.com/v1/me/tracks/contains?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch user liked songs [Spotify API] failed with status: ${response.status}`);
    }

    const likedTracks: Array<boolean> = await response.json();
    return likedTracks;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default checkUserSavedTracks;