# Spotify Authentication Flow
This file handles Spotify user authentication using the <a href="https://developer.spotify.com/documentation/web-api/tutorials/code-flow" target="_blank">Auth Code Flow</a>. Handles login, session management and access/refresh tokens. It contains the following routes:

## Routes

### ```GET /login```
**Description**

This route initiates the Spotify Authorization Code flow by redirecting users to the Spotify authorization page. It requests permission for the specified scopes and stores a state value in a cookie for CSRF protection.

**Usage**
```bash
GET /login?redirectUrl=<url>
```

**Query parameters**
- *redirectUrl* (Optional): The URL which the user will be redirected to after successful auth. If not provided, redirect to /discover page (served on frontend using Vue Router). This is used to maintain the current recommendation tag(s) state that the user selected from the landing page.

**Functionality**
- Generates a random state value and sets it as a cookie
- Redirects the user to Spotify's auth endpoint, passing along the clientId, redirectUri, api scope (all found in .env file), and state

### ```GET /callback```
**Description**

Handles Spotify callback after the user has granted permissions. It exchanges the auth code for access and refresh tokens, updates the session with these tokens, and redirects the user to the specified redirection URL.

**Usage**
```
GET /callback?code=<authorization_code>&state=<state>
```

**Query parameters**
- *code*: The auth code returned from Spotify after the user grants permissions.
- *state*: The state parameter for CSRF validation, compared against the value stored in the cookie

**Functionality**
- Validates the state parameter to prevent CSRF attacks.
- Calls the **fetchSpotifyToken** function to exchange the code for an access token.
- Fetches the user’s Spotify profile using **fetchSpotifyUser** with the access token.
- Updates the session with the access token, refresh token, and user data.
- Redirects the user to the requested page or the default discover page.

An overview of how the Spotify auth flow works is shown:

<img src="https://developer.spotify.com/images/documentation/web-api/auth-code-flow.png" alt="auth flow diagram" width="600">

### ```GET /refresh_token```
**Description**

This route refreshes the user’s access token when it expires, using the stored refresh token.

**Usage**

```
GET /refresh_token
```

**Functionality**
- Extracts the user's refresh_token from the session
- Sends a request to Spotify to obtain a new access token
- Updates session with new access token and refresh token
- Returns new access token in response

**Response**
```json
{
  "access_token": "newAccessToken"
}
```

### ```GET /status```
**Description**

This route provides info about the user's current session status, i.e. logged in status + session token info. If not logged in, it defaults to this:
```json
{
  "spotifyInfo": null,
  "isLoggedIn": false,
}
```

**Usage**
```
GET /status
```

**Example Response**
```json
{
  "spotifyInfo": {},
  "isLoggedIn": true,
}
```
spotifyInfo is essentially the entire object returned from the Spotify API's ```/me``` route. More info <a href="https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile" target="_blank">here</a>.

### ```GET /logout```
**Description**

Logs the user out by destroying session and redirecting to homepage

**Usage**
```
GET /logout
```
**Functionality**
- Destroys the user session, including all authentication tokens.
- Redirects to the homepage.

## Utility Functions
```ts
generateRandomString(length: number)
```

Generates a random string of specified length using the *crypto* library. Used for state in the auth flow.

```ts
updateSession(req: Request, tokenResponse: TokenResponse, spotifyData: SpotifyUserResponse)
```
This helper function updates the session with the user’s Spotify tokens and profile information.

**Parameters**

- req: The Express request object, which includes the session. Has been interfaced to include additional data that is relevant to user's personal spotify info (including access token)
- tokenResponse: The response from Spotify’s token endpoint, containing the access token and refresh token
- spotifyData: The user’s profile data returned from Spotify

## Dependecies
- *crypto*: Used to generate random strings for the state parameter.
- *querystring*: Used to construct query parameters for the Spotify authorization URL.
- *fetchSpotifyToken*: Utility function to exchange authorization codes for tokens.
- *fetchSpotifyUser*: Utility function to fetch user profile data from Spotify.

## Example Usage
1. User clicks a "Login with Spotify" button on the frontend.
2. Frontend makes a GET /login request.
3. User is redirected to Spotify's authorization page.
4. After authorization, Spotify redirects the user back to /callback.
5. Access and refresh tokens are stored in the session.
6. The frontend can now fetch the user’s Spotify data (profile picture) and make authenticated requests using the user's own access token. 

The frontend will also be able to interact with the user's Spotify account (not implemented yet, but for example, adding recommended songs to user's library, using user's top songs to suggest what to find recommendations for, excluding songs already in user's library from being recommended)