// This function will fetch the spotify token, BUT it will return it as a TokenResponse type (in /types)
// Not to be confused with the getClientAccessToken, which returns a direct string (the access token itself)

import { TokenResponse } from "../types/spotifyTokenResponse"

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  REDIRECT_URI: redirectUri,
} = process.env;

const fetchSpotifyToken = async(code: string | null): Promise<TokenResponse> => {
  const params = new URLSearchParams({
    code: code || '',
    redirect_uri: redirectUri || 'http://localhost:3443/api/auth/callback',
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
    throw new Error(`HTTP error, status: ${response.status}`);
  }

  return response.json();
};

export { fetchSpotifyToken };