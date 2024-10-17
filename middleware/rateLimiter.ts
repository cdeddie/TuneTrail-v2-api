import { Request, Response, NextFunction } from 'express';

type RequestInfo = {
  timestamp: number;
  ip: string;
};

export class GlobalSlidingWindowRateLimiter {
  public requests: RequestInfo[] = [];                         // Global requests queue
  public userRequests: Map<string, number[]> = new Map();      // Requests per user (by ip)
  public userBusyRequests: Map<string, number[]> = new Map();  // Requests per user, only used when busy
  public activeUsers: Set<string> = new Set();

  public globalLimit: number;
  public windowSize: number;
  public busyThreshold: number;      // As percentage (i.e. 0.4)

  constructor(windowSizeInSeconds: number, globalLimit: number, busyThreshold: number) {
    this.globalLimit = globalLimit;
    this.windowSize = windowSizeInSeconds * 1000;
    this.busyThreshold = busyThreshold;
  }

  checkLimit(ip: string): { allowed: boolean; warning: boolean } {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    // Clean global requests older than the window
    while (this.requests.length && this.requests[0].timestamp <= windowStart) {
      this.requests.shift();
    }

    // Track unique users
    if (!this.userRequests.has(ip)) {
      this.userRequests.set(ip, []);
    }

    if (!this.userBusyRequests.has(ip)) {
      this.userBusyRequests.set(ip, []);
    }

    let currUserRequests = this.userRequests.get(ip)!;
    let currUserBusyRequests = this.userBusyRequests.get(ip)!;

    // Filter out old user requests
    currUserRequests = currUserRequests.filter(timestamp => timestamp > windowStart);
    currUserBusyRequests = currUserBusyRequests.filter(timestamp => timestamp > windowStart);

    this.userRequests.set(ip, currUserRequests);
    this.userBusyRequests.set(ip, currUserBusyRequests);
    this.activeUsers.add(ip);

    // If trafic is busy, switch to user quotas
    const remainingRequests = this.globalLimit - this.requests.length;
    const isBusy = (remainingRequests / this.globalLimit) <= this.busyThreshold;

    let allowed = false;
    let warning = false;

    // Start using dynamic quota - needs to be quota of REMAINING number of requests
    if (isBusy) {
      const userQuota = Math.floor(remainingRequests / this.activeUsers.size);
      console.log(userQuota, currUserBusyRequests.length);

      // Compare userQuota to the length of the users request array in userBusyRequests map
      allowed = currUserBusyRequests.length + 1 < userQuota;
      warning = currUserBusyRequests.length >= Math.floor(userQuota / 2);
    } else {
      // Regular global limiter logic when not busy
      allowed = this.requests.length < this.globalLimit;
      warning = false;
    }

    if (allowed) {
      if (!isBusy) {
        this.requests.push({ timestamp: now, ip });
        currUserRequests.push(now);
        this.userRequests.set(ip, currUserRequests);
      } else if (isBusy) {
        currUserBusyRequests.push(now);
        this.userBusyRequests.set(ip, currUserBusyRequests);
      }
    }

    return { allowed, warning };
  }
}

export const globalRateLimiter = new GlobalSlidingWindowRateLimiter(60, 160, .6);

export function globalRateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;

  if (!ip) {
    console.error('Unable to determine client IP address');
    return res.status(500).send('Internal Server Error. Unable to determine client IP address.');
  }

  const { allowed, warning } = globalRateLimiter.checkLimit(ip);

  if (warning) {
    res.setHeader('X-Rate-Limit-Warning', 'True');
  }

  if (allowed) {
    next();
  } else {
    res.status(429).send('Too Many Requests');
  }
}