import 'dotenv/config';
import express, { Application }   from 'express';
import session                    from 'express-session';
import cookieparser               from 'cookie-parser';
import cors                       from 'cors';

const app: Application = express();

import { router as spotifyRouter }  from './routes/spotifyRoutes';
import { router as authRouter }     from './routes/auth';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3443;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_tunetrail_session_secret';

app.use(express.json());
app.use(cookieparser());

app.enable('trust proxy');

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://tunetrail.cdeddie.dev',
      'https://tunetrail.site', 
      'https://staging.tunetrail.site',
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];

    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/', spotifyRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TuneTrail API listening on port ${PORT}`);
});

