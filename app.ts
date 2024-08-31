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
app.use(cookieparser());

app.enable('trust proxy');

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://tunetrail.site' : true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/', spotifyRouter);
app.use('/api/auth', authRouter);

app.listen(process.env.PORT);
