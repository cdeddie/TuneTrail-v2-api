# Spotify API Wrapper Routes
This file handles backend routes that essentially extend the Spotify API routes. For some, they are essentially simple wrappers, but some routes provide additional logic/functionality for the frontend. 

Some routes distinguish between logged in and non-logged in users, such as the ```/recommendations``` route. This allows users that have not logged in using Spotify to still find recommendations (using the client credential flow). These specific routes make use of two different service functions that wrap the same Spotify API route - either a public service function (for non-logged in users), or a private service function.

However, using public service functions can put strain on the backend. I believe that I read online (estimated by an individual) that the Spotify API has a rate limit of around 180 requests per minute. For this reason, I created a basic rate limiter that acts on some of the routes in this file.

All types used are from @types/spotify-api

## Routes
### ```GET /top-50/:country```
**Description**

This route is currently not in use on the frontend, but in the future I plan on adding a Spotify charting frontend, which takes data from the Spotify Top-50 playlists for each country.

**Usage**
```
GET /top-50/<country: string>
```

**Query parameters**
- *country*: A string for the valid countries (countries that have the top-50 json data in /data) which are tracked. 

**Functionality**
- Returns the playlist data which is stored in the json file within /data. For more info on spotify playlist data, see <a href="https://developer.spotify.com/documentation/web-api/reference/get-playlist" target="_blank">here</a>.

### ```GET /search && GET /public-search```
**Description**

These routes wrap the Spotify /search route (more details <a href="https://developer.spotify.com/documentation/web-api/reference/search" target="_blank">here</a>). The `/search` route is intended for users that have logged in with Spotify auth, while the `/public-search` is intended for public users and makes use of a basic rate limiting middleware. 

**Usage**
```
/GET search?query=<query>&type=<'artist' | 'track'>
```

**Query parameters**
- *query*: user input string. Needs to be encoded i.e. **encodeURIComponent(query.toLowerCase())**. Important that the query before encoded needs to be set to lower case.
- *type*: The frontend only makes use of 'artist' and 'track' type, but the Spotify API supports further types.

**Functionality**

Currently the limit (number of items returned) is hardcoded to 5. This is due to only displaying the first 5 items in the search results on the frontend.

In the `public-search` route, if cached data exists for the requested query and type, it is served directly from Redis.

**Response**

Depending on the *type* provided, the response can either be a `SpotifyApi.ArtistSearchResponse` or a `SpotifyApi.TrackSearchResponse`. 

### `GET /recommendation && GET /public-recommendation`
**Description**

These routes wrap the Spotify /recommendations endpoint (details here). The `/recommendation route` is for logged-in users and the `/public-recommendation` route is designed for non-logged-in users and uses the client credentials flow. The public-recommendation route also applies a rate limiter. 

**Usage**
```
GET /recommendation?limit=<number>&tags=<seed_ids>&recTargets=<targets>&seedType=<type>
```

**Query parameters**
- *limit*: The number of recommendations to fetch. Spotify API allows a maximum value of 100.
- *tags*: A comma-separated list of seed IDs to base recommendations on. The seed type is determined by the seedType parameter (either artist or track IDs).
- *recTargets* (optional): A string of recommendation target attributes, formatted as attribute=value pairs, separated by commas. Supported attributes include acousticness, energy, danceability, tempo, etc. Example: energy=70,danceability=50.
- *seedType*: Either 'Artist' or 'Track'

**Response**
Both routes return a `SpotifyApi.RecommendationsObject` object.

## Middlewares
### `GlobalLimiter.middleware()`
Applies a rate limit to public-facing routes such as /public-search and /public-recommendation. Ensures backend resources are used efficiently and helps comply with Spotify's API rate limits.

### `refreshTokenIfNeeded`
A middleware that refreshes a user’s Spotify access token if it has expired. Ensures that private routes requiring authentication continue to function seamlessly.