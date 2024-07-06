import querystring from 'querystring';
import { Request, Response, NextFunction } from 'express';  

const { CLIENT_ID: clientId, CLIENT_SECRET: clientSecret } = process.env;

const refreshTokenIfNeeded = async(req: Request, res: Response, next: NextFunction) => {
  if (req.session.token_expiry && Date.now() > req.session.token_expiry) {
    try {
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        },
        body: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: req.session.refresh_token
        })
      });

      if (!refreshResponse.ok) {
        throw new Error(`Refresh token call failed with status: ${refreshResponse.status}`);
      }

      const refreshData = await refreshResponse.json();
      req.session.access_token = refreshData.access_token;
      // update the refresh token if Spotify returns a new one
      if (refreshData.refresh_token) {
        req.session.refresh_token = refreshData.refresh_token;
      }
      // update token expiry time
      req.session.token_expiry = Date.now() + (refreshData.expires_in - 60) * 1000;
      next();
    } catch (error) {
      console.error('Error refreshing access token:', (error as Error).message);
      return res.status(500).send('Failed to refresh access token');
    }
  } else {
    // token is still valid, or there's no token
    next();
  }
};

export default refreshTokenIfNeeded;