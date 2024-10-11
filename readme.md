# TuneTrail Backend

## About
Express backend for a music recommendation app that makes use of the <a href="https://developer.spotify.com/documentation/web-api" target="_blank">Spotify API</a>. Provides two ways for the frontend to make requests to the Spotify API, either using *Auth Code Flow* for logged in users or *Client Credentials Flow*. Auth code flow stores users token details in sessions.

## Setup

Make sure you have node v20+ installed. Use npm to install the dependencies
```bash
npm install
```

You will need to provide your own Spotify API information. You can read more on this <a href="https://developer.spotify.com/documentation/web-api/tutorials/getting-started" target="_blank">here</a>. After following the steps in the Spotify documentation, create a .env file based on the .env.template

This project makes use of Nodemon for TypeScript. Run a local server by doing
```bash
npm run dev
```