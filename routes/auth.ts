import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';
import crypto from 'crypto';
import { TokenResponse } from '../types/spotifyTokenResponseType';
import fetchSpotifyRecommendations from '../services/public/fetchSpotifyRecommendations';
import { fetchSpotifyToken } from '../utils/fetchSpotifyToken';
import { fetchSpotifyUser } from '../utils/fetchSpotifyUser';

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  REDIRECT_URI: redirectUri,
  STATE_KEY: stateKey,
  SCOPE: scope
} = process.env;

declare module 'express-session' {
  interface Session {
    access_token?: string;
    refresh_token?: string;
    is_logged_in?: boolean;
    token_expiry?: number;
    spotify_id?: string;
  }
}

const router: Router = express.Router();

const generateRandomString = (length: number) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
};

router.get('/login', (req: Request, res: Response) => {
  const state = generateRandomString(16);
  res.cookie(stateKey as string, state);

  const redirectUrl = 'https://accounts.spotify.com/authorize?' +
  querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state
  });

  res.redirect(redirectUrl);
});

// Helper function to update session on /callback
const updateSession = (req: Request, tokenResponse: TokenResponse, spotifyId: string): void => {
  req.session.access_token = tokenResponse.access_token;
  req.session.refresh_token = tokenResponse.refresh_token;
  req.session.is_logged_in = true;
  req.session.token_expiry = Date.now() + (tokenResponse.expires_in - 60) * 1000;
  req.session.spotify_id = spotifyId;
};

// Exchange code for access token, requests refresh and access tokens after checking state param
router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string || null;
  const state = req.query.state as string || null;
  const storedState = req.cookies ? req.cookies[stateKey as string] : null;

  if (state === null || state !== storedState) {
    // redirect to home page ( adjust later )
    res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}).toString());
    return;
  } 

  res.clearCookie(stateKey as string);

  try {
    const tokenResponse = await fetchSpotifyToken(code);
    const userResponse = await fetchSpotifyUser(tokenResponse.access_token);

    updateSession(req, tokenResponse, userResponse);

    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : 'https://tunetrail.site';

    res.redirect(baseUrl);
  } catch (error) {
    console.error('Error during authentication callback from Spotify:', (error as Error).message);
    res.redirect('/#' + new URLSearchParams({ error: 'invalid_token' }).toString());
  } 
});

router.get('/refresh_token', async (req: Request, res: Response) => {
  const refresh_token = req.session.refresh_token;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh_token as string
  });

  const authOptions = {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: params
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    
    if (response.ok) {
      const data: TokenResponse = await response.json();
      const { access_token, refresh_token: new_refresh_token } = data;

      req.session.access_token = access_token;
      if (new_refresh_token) {
        req.session.refresh_token = new_refresh_token;
      }

      res.json({ access_token });
    } else {
      res.status(response.status).send(response.statusText);
    }
  } catch (error) {
    console.error('Error refreshing token:', (error as Error).message);
    res.status(500).send('Error refreshing token');
  }
});

router.get('/status', (req, res) => {
  res.json({ isLoggedIn: !!req.session.is_logged_in });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during logout:', err.message);
      res.status(500).send('Error during logout');
    }
    res.status(200).send('Logged out');
    //res.redirect('localhost:5173/'); // PROD CHECK
  })
});

export { router };