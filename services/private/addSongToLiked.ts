import { Request } from 'express';

const addSongToLiked = async(req: Request, id: string) => {
  const token = req.session.access_token;
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Add track to liked songs [Spotify API] failed with status: ${response.status}`);
    }

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default addSongToLiked;