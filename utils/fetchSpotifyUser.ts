import { SpotifyUserResponse } from "../types/spotifyUserResponse";

const fetchSpotifyUser = async (accessToken: string): Promise<SpotifyUserResponse> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as SpotifyUserResponse;
  return data;
};

export { fetchSpotifyUser };
