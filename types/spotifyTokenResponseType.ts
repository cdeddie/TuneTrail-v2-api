export type TokenResponse = {
  access_token: string,     // Access token that can be provided in subsequent calls
  token_type: string,       // How the access token may be used, always "Bearer"
  expires_in: number        // The time period (in seconds) for which the token is valid
  refresh_token?: string,   // These two values are not valid in client-credentials..
  scope?: string,           // auth method. They are only used for auth flow (involving user)
}