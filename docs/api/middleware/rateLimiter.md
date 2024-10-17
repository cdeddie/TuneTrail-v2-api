# Rate Limiter
Custom rate limiter I wrote. The idea behind it is that there is no user-specific limit per window (which is 60 seconds in my case), until 60% of the quota has been used. At that point, the remaining quota is divided equally between all current active users in the window.

## Features
- Global rate limiting with sliding window (removes old users requests)
- Dynamic quota allocation when traffic is busy, with user-specific limiting
- Sends a warning header when half of the user's *'busy'* quota is reached
- Exports a middleware function that uses a global rateLimiter object

## Functions
### ```constructor(windowSizeInSeconds: number, globalLimit: number, warningLimit: number, busyThreshold: number)```
Creates a new instance of the rate limiter. This is used once in the rateLimiter file to use as a global object.

#### Parameters
- ```windowSizeInSeconds```: The size of the window in seconds. 60 seconds in my app.
- ```globalLimit```: Maximum number of requests. I found a thread online that claimed Spotify API usually around 160 requests per minute.
- ```busyThreshold```: Percentage of global limit at which the limiter switches to user-specific quotas

### ```checkLimit(ip: string): { allowed: boolean; warning: boolean }```
This is the core of the rate limiter - it will check to see if the rate limit has been hit, and will also check the user warning map to see if a warning needs to be sent. Returns a boolean for each.

### ```globalRateLimiterMiddleware(req: Request, res: Response, next: NextFunction)```
Express middleware that applies the rateLimiter to incoming requests

- Sets the 'X-Rate-Limit-Warning' header if a warning is issued
- Calls next() if the request is allowed
- Sends a 429 status code if the request is denied

### Notes
- No cleanup method, the old requests/users get removed using ```.filter()```

