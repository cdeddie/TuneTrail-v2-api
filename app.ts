import express, { Application, Request, Response }  from 'express';
import session                                      from 'express-session';
import cookieparser                                 from 'cookie-parser';
import cors                                         from 'cors';
import dotenv                                       from 'dotenv';

const app: Application = express();
dotenv.config();

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

app.use('/api/', spotifyRouter);
app.use('/api/auth', authRouter);

app.listen(process.env.PORT);