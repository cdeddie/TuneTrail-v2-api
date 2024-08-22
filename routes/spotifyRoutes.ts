import express, { Request, Response } from 'express';
import fs                             from 'fs/promises';
import path                           from 'path';

import fetchSpotifySearch                 from '../services/public/fetchSpotifySearch';
import fetchSpotifyRecommendations        from '../services/public/fetchSpotifyRecommendations';
import fetchSpotifyRecommendationsPrivate from '../services/private/fetchSpotifyRecommendationsPrivate';
import refreshTokenIfNeeded               from '../middleware/refreshTokenIfNeeded';

const router = express.Router();

router.get('/top-50/:country', async (req: Request, res: Response) => {
  try {
    const country = req.params.country;

    const filePath = path.join(__dirname, '..', 'data', `top_50_${country}.json`);

    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    return res.status(200).send(jsonData);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get('/search', async(req: Request, res: Response) => {
  const ip = req.ip;

  if (!ip) {
    console.error('Unable to determine client IP address');
    return res.status(500).send('Internal Server Error');
  }

  try {
    const { data, warning } = await fetchSpotifySearch(req, ip);

    if (warning) {
      res.setHeader('X-Rate-Limit-Warning', 'True');
    }

    return res.status(200).send(data);
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return res.status(429).send({ error: error.message });
    }
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/recommendations', refreshTokenIfNeeded, async(req: Request, res: Response) => {
  const ip = req.ip;

  if (!ip) {
    console.error('Unable to determine client IP address');
    return res.status(500).send('Internal Server Error');
  }

  try {
    let recommendations;
    if (req.session.is_logged_in) {
      recommendations = await fetchSpotifyRecommendationsPrivate(req);
    } else {
      const { data, warning } = await fetchSpotifyRecommendations(req, ip);
      
      if (warning) {
        res.setHeader('X-Rate-Limit-Warning', 'True');
      }

      recommendations = data;
    }
    return res.status(200).send(recommendations);
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return res.status(429).send({ error: error.message });
    }
    console.error(error);
    return res.status(500).send(error);
  }
});

export { router };