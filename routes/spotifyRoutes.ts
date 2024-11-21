import express, { Request, Response } from 'express';
import { GlobalLimiter }              from '../middleware/rateLimiter';
import redisClient                    from '../utils/redisClient';
import fs                             from 'fs/promises';
import path                           from 'path';

import fetchSpotifySearchPublic           from '../services/public/fetchSpotifySearchPublic';
import fetchSpotifySearchPrivate          from '../services/private/fetchSpotifySearchPrivate';
import fetchSpotifyRecommendationsPublic  from '../services/public/fetchSpotifyRecommendationsPublic';
import fetchSpotifyRecommendationsPrivate from '../services/private/fetchSpotifyRecommendationsPrivate';
import refreshTokenIfNeeded               from '../middleware/refreshTokenIfNeeded';

const router = express.Router();

const rateLimiter = GlobalLimiter.middleware();

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

router.get('/search', refreshTokenIfNeeded, async(req: Request, res: Response) => {
  try {
    const data = await fetchSpotifySearchPrivate(req);

    return res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/public-search', rateLimiter, async(req: Request, res: Response) => {
  try {
    const { query, type } = req.query;
    const cacheKey = `search:${query}:${type}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving search from redis');
      return res.status(200).send(JSON.parse(cachedData));
    }

    const data = await fetchSpotifySearchPublic(req);
    await redisClient.setEx(cacheKey, 360, JSON.stringify(data));

    return res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/recommendation', refreshTokenIfNeeded, async(req: Request, res: Response) => {
  try {
    const data = await fetchSpotifyRecommendationsPrivate(req);

    return res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/public-recommendation', rateLimiter, async(req: Request, res: Response) => {
  try {
    const { limit, tags, recTargets, seedType } = req.query;
    const cacheKey = `recommendation:${limit}:${tags}:${recTargets}:${seedType}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving recommendation from redis');
      return res.status(200).send(JSON.parse(cachedData));
    }

    const data = await fetchSpotifyRecommendationsPublic(req);
    await redisClient.setEx(cacheKey, 360, JSON.stringify(data));

    return res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

export { router };