import { Request, Response, NextFunction } from 'express';

class SlidingWindowRateLimiter {
  private windowSize: number;
  private limit: number;
  private requests: Map<string, number[]>;    // key is ip, value is an array of request timestamps

  constructor(windowSizeInSeconds: number, limit: number) {
    this.windowSize = windowSizeInSeconds * 1000;
    this.limit = limit;
    this.requests = new Map();
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key)!;
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

    this.requests.set(key, recentRequests);
    
    if (recentRequests.length < this.limit) {
      recentRequests.push(now);
      return true;
    }

    return false;
  }
}

const rateLimiter = new SlidingWindowRateLimiter(5, 13);

export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.ip!;

  if (rateLimiter.isAllowed(key)) {
    next();
  } else {
    res.status(429).send('Too Many Requests');
  }
}