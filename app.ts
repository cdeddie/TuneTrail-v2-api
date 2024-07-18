import express, { Application, Request, Response }  from 'express';
import session                                      from 'express-session';
import cookieparser                                 from 'cookie-parser';
import cors                                         from 'cors';
import dotenv                                       from 'dotenv';

const app: Application = express();
dotenv.config();

import fetchGlobalPlaylistData      from './scripts/fetchGlobalPlaylistData';
import { router as spotifyRouter }  from './routes/spotifyRoutes';
import { router as authRouter }     from './routes/auth';

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production'}
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://tunetrail.site' : true,
  credentials: true,
}));

app.use(cookieparser());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server Working!');
});

app.get('/test', async (req: Request, res: Response) => {
  fetchGlobalPlaylistData();
  res.send('success!');
});

app.use('/', spotifyRouter);
app.use('/auth', authRouter);

app.listen(process.env.PORT);