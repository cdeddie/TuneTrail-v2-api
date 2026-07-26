// This function will fetch the spotify token, BUT it will return it as a TokenResponse type (in /types)
// Not to be confused with the getClientAccessToken, which returns a direct string (the access token itself)

import { TokenResponse } from "../types/spotifyTokenResponse"

const fetchSpotifyToken = async(code: string | null): Promise<TokenResponse> => {
  const clientId = process.env.CLIENT_ID || '';
  const clientSecret = process.env.CLIENT_SECRET || '';
  const redirectUri = process.env.REDIRECT_URI || 'https://tunetrail.cdeddie.dev/api/auth/callback';

  if (!clientId || !clientSecret) {
    throw new Error(`Spotify CLIENT_ID or CLIENT_SECRET is missing in environment variables.`);
  }

  const params = new URLSearchParams({
    code: code || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify token exchange error (${response.status}): ${errorText}`);
  }

  return response.json();
};

export { fetchSpotifyToken };