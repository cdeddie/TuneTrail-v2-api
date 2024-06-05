import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

import fetchSpotifySearch from '../services/public/fetchSpotifySearch';
import fetchSpotifyRecommendations from '../services/public/fetchSpotifyRecommendations';

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

router.get('/public-search', async(req: Request, res: Response) => {
  try {
    const response = await fetchSpotifySearch(req);

    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.get('/public-recommendations', async(req: Request, res: Response) => {
  try {
    const response = await fetchSpotifyRecommendations(req);

    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export { router };