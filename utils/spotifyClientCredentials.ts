import { TokenResponse }  from "../types/spotifyTokenResponse";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

let accessToken: string = "";
let tokenExpiry: number | null = null;

export const getClientAccessToken = async (): Promise<string> => {
  try {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
    }

    const token_data = await response.json() as TokenResponse;
    accessToken = token_data.access_token;
    tokenExpiry = Date.now() + (token_data.expires_in - 60) * 1000;
    return accessToken;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const errorResponse = await error.response;
      console.error('Error in getAccessToken:', errorResponse);
    } else {
      console.error('Error in getAccessToken:', error);
    }
    throw error;
  }
}