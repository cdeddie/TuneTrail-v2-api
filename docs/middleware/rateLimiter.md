# Rate Limiter
## Overview
Express middleware uses sliding window queue to control request rates. Tracks both individual user requests while also mantaining a global request count to provide warning and blocking thresholds. There are two classes - ```SlidingWindowCounter``` and ```RateLimiter```. The first class is used as a reusable data structure in a user map in the RateLimiter class, to track requests per each unique user.

## ```SlidingWindowCounter``` class
### Member variables
- **queue**: Queue of type ```RequestRecord```, which simply stores a timestamp. Used a type for potential changes in future (maybe adding an ip to each record, etc).
- **windowMs**: Length of window in ms

### Member functions
- **```add(timestamp: number): void```**: Adds the current request to the queue, then proceeds to clean the queue
- **```private cleanup(now: number): void```**: Cleans the queue by shifting any requests that are older than the current window size
- **```getCount(now: number): number```**: Returns the total number of requests in the current window, indicated by the length of the queue.
- **```isEmpty(): boolean```**: Returns true if the queue is empty. Used for cleanup in the RateLimiter class.

## ```RateLimiter``` class

### Member variables
- **userCounters**: Maps a SlidingWindowCounter container to each ip (string). Used for user specific warnings and blocking
- **globalCounter**: Used for tracking the total number of requests
- **config**: Uses the RateLimitConfig type to setup the rate limiter, with these parameters:
```ts
type RateLimitConfig = {
  windowMs: number;              // Time of window in ms
  maxRequests: number;           // Maximum requests allowed in that window
  userWarningThreshold: number;  // Percentage of max requests that triggers warning
  userBlockThreshold: number;    // Percentage of max requests that triggers blocking
};
```
Keep in mind that the rate limiter will allow ```maxRequests - 1``` amount of requests in a window. And the logic related to the two thresholds operates on greater-than i.e. if ```maxRequests``` is 10 and ```userWarningThreshold``` is 30, then the warning header will be set on the 4th request, not the 3rd request.
- **lastCleanup**: Used for keeping track of when the userCounters map should be cleaned. 

### Member functions
- **```private getClientIdentifier(req: Request)```**: Not really sure if I should even have this as a function
- **```private calculateThreshold (percentage: number): number```**: Given a percentage (30, 40 etc) returns the percentage of the maxRequests. Used for warning/blocking
- **```private getUserCounter(clientId: string): SlidingWindowCounter```**: Returns the SlidingWindowCounter object associated with a particular user, if that user does not exist in the *userCounters* map, then that user is inserted.
- **```private cleanupUserCounters(now: number): void```**: Iterates over all user counters and performs cleanup on each - uses cleanup() function from SlidingWindowCounter class
- **```middleware()```**: Actual rate limiter logic function.
    - If it has been more than 5 minutes since last cleanup, then cleanup now.
    - Adds the current request to both the global window and the user window.
    - Sets some headers that give info to client. Conditionally sets 'X-RateLimit-Warning' if user has consumed more requests than the warning threshold (15%)
    - Returns 429 error if user exceeded the block threshold (30% of requests in 1 minute window)

### Usage Example
```ts
import { GlobalLimiter } from 'middleware/rateLimiter.ts';

const router = express.Router();
router.use(GlobalLimiter.middleware());
```