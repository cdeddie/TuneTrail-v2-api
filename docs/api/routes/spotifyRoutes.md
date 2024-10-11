# Spotify API Wrapper Routes
This file handles backend routes that essentially extend the Spotify API routes. For some, they are essentially simple wrappers, but some routes provide additional logic/functionality for the frontend. 

Some routes distinguish between logged in and non-logged in users, such as the ```/recommendations``` route. This allows users that have not logged in using Spotify to still find recommendations (using the client credential flow). These specific routes make use of two different service functions that wrap the same Spotify API route - either a public service function (for non-logged in users), or a private service function.

However, using public service functions can put strain on the backend. I believe that I read online (estimated by an individual) that the Spotify API has a rate limit of around 180 requests per minute. For this reason, I created a basic rate limiter that acts on some of the service functions that are present in certain routes in this file.

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

### ```GET /search```
**Description**

This route wraps the Spotify /search route (more details <a href="https://developer.spotify.com/documentation/web-api/reference/search" target="_blank">here</a>). This route also makes use of a service function **fetchSpotifySearch** which includes rate limiting, which requires the users ip to execute.

**Usage**
```
/GET search?query=<query: string>&type=<artist | track>
```

**Query parameters**
- *query*: user input string. Needs to be encoded i.e. **encodeURIComponent(query.toLowerCase())**. Important that the query before encoded needs to be set to lower case.
- *type*: The frontend only makes use of 'artist' and 'track' type, but the Spotify API supports further types.

**Functionality**<br>
Currently the limit (number of items returned) is hardcoded to 5. This is due to only displaying the first 5 items in the search results on the frontend.

**Response**<br>
Depending on the *type* provided, the response can either be a `SpotifyArtistSearchResponse` or a `SpotifyTrackSearchResponse`. They both follow a structure like so:

```ts
export type SpotifyArtistSearchResponse = {
  href: string;
  items: Item[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};
```
However, the Item type is different in each (one representing a Track, the other an Artist).
