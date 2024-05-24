import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

router.get('/top-50/:country', async (req: Request, res: Response) => {
  try {
    const country = req.params.country;

    const filePath = path.join(__dirname, '..', 'data', `top_50_${country}.json`);
    console.log(filePath);
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    return res.status(200).send({ data: jsonData });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

export { router };