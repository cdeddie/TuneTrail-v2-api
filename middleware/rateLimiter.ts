import { Request, Response, NextFunction } from 'express';

type RateLimitConfig = {
  windowMs: number;                   // Time of window in ms
  maxRequests: number;                // Maximum requests allowed in that window
  userWarningThreshold: number;       // Percentage of max requests that triggers warning (passed as whole number, e.g. 20 meaning 20%)
  userBlockThreshold: number;         // Percentage of max requests that triggers blocking
};

type RequestRecord = {
  timestamp: number;
}

class SlidingWindowCounter {
  private queue: RequestRecord[];
  private windowMs: number;

  constructor(windowMs: number) {
    this.queue = [];
    this.windowMs = windowMs;
  }

  add(timestamp: number): void {
    this.queue.push({ timestamp } as RequestRecord);
    this.cleanup(timestamp);
  }

  private cleanup(now: number): void {
    const windowStart = now - this.windowMs;
    while (this.queue.length > 0 && this.queue[0].timestamp <= windowStart) {
      this.queue.shift();
    }
  }

  getCount(now: number): number {
    this.cleanup(now);
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}

export class RateLimiter {
  private userCounters : Map<string, SlidingWindowCounter>;
  private globalCounter: SlidingWindowCounter;
  private config: RateLimitConfig;
  private lastCleanup: number = Date.now();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: config.windowMs || 60 * 1000,                   // Default: 1 minute
      maxRequests: config.maxRequests || 150,                   // Default: 150 requests per window
      userWarningThreshold: config.userWarningThreshold || 15,  // 15% of max requests
      userBlockThreshold: config.userBlockThreshold || 30,      // 30% of max requests
    };

    this.userCounters = new Map();
    this.globalCounter = new SlidingWindowCounter(this.config.windowMs);
  };

  private getClientIdentifier(req: Request) {
    return req.ip || 'unknown';
  };

  private calculateThreshold (percentage: number): number {
    return Math.floor((percentage / 100)  * this.config.maxRequests);
  };

  private getUserCounter(clientId: string): SlidingWindowCounter {
    let counter = this.userCounters.get(clientId);

    if (!counter) {
      counter = new SlidingWindowCounter(this.config.windowMs);
      this.userCounters.set(clientId, counter);
    }

    return counter;
  };

  private cleanupUserCounters(now: number): void {
    for (const [clientId, counter] of this.userCounters.entries()) {
      counter.getCount(now);
      
      // If counter is empty after cleanup, remove it from the Map
      if (counter.isEmpty()) {
        this.userCounters.delete(clientId);
      }
    }
  };

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const now = Date.now();
      const clientId = this.getClientIdentifier(req);
      const userCounter = this.getUserCounter(clientId);

      // Cleanup
      if (now - this.lastCleanup > 5 * 60 * 1000) { // Every 5 minutes
        this.cleanupUserCounters(now);
        this.lastCleanup = now;
      }

      // Add current request to both user and global counters
      userCounter.add(now);
      this.globalCounter.add(now);

      // Get current counts
      const userCount = userCounter.getCount(now);
      const globalCount = this.globalCounter.getCount(now);
      
      // Calculate thresholds and remaining requests
      const remainingRequests = this.config.maxRequests - globalCount;
      const userWarningThreshold = this.calculateThreshold(this.config.userWarningThreshold);
      const userBlockThreshold = this.calculateThreshold(this.config.userBlockThreshold);

      // Check if user has exceeded warning threshold
      if (userCount > userWarningThreshold) {
        res.setHeader('X-RateLimit-Warning', 'Suspicious activity detected');
      }

      // Check if request should be blocked
      if (userCount > userBlockThreshold || remainingRequests <= 0) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(this.config.windowMs / 1000)
        });
      }

      next();
    };
  }
};

export const GlobalLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 150,
  userWarningThreshold: 15,
  userBlockThreshold: 30,
});