import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Uses a global requests array and a per-user requests map. The array is used for enforcing the global limit, and 
// the map is used to send a warning header to individual users if they are sending requests too fast.

type RequestInfo = {
  timestamp: number;
  ip: string;
};

class GlobalSlidingWindowRateLimiter {
  private requests: RequestInfo[];
  private userWarnings: Map<string, number[]>;

  private limit: number;
  private warningLimit: number;
  private windowSize: number;
  private warningWindowSize: number;
  private logFolder: string;

  constructor(windowSizeInSeconds: number, limit: number, warningWindowSizeInSeconds: number, warningLimit: number, logFolder: string) {
    this.requests = [];
    this.userWarnings = new Map();

    this.limit = limit;
    this.warningLimit = warningLimit;
    this.windowSize = windowSizeInSeconds * 1000;
    this.warningWindowSize = warningWindowSizeInSeconds * 1000;
    this.logFolder = logFolder;

    // Ensure the log folder exists
    if (!fs.existsSync(this.logFolder)) {
      fs.mkdirSync(this.logFolder, { recursive: true });
    }
  }

  checkLimit(ip: string): { allowed: boolean; warning: boolean } {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    const warningWindowStart = now - this.warningWindowSize;

    // Remove old requests
    this.requests = this.requests.filter(request => request.timestamp > windowStart);

    // Check global limit
    const allowed = this.requests.length < this.limit;

    // Check user-specific warning
    if (!this.userWarnings.has(ip)) {
      this.userWarnings.set(ip, []);
    }
    let userRequests = this.userWarnings.get(ip)!;
    userRequests = userRequests.filter(timestamp => timestamp > warningWindowStart);
    this.userWarnings.set(ip, userRequests);

    const warning = userRequests.length >= this.warningLimit;

    if (allowed) {
      this.requests.push({ timestamp: now, ip });
      userRequests.push(now);
    } else {
      this.logExceededRequests();
    }

    return { allowed, warning };
  }

  private logExceededRequests() {
    const logFileName = `rate_limit_exceeded_${new Date().toISOString().replace(/:/g, '-')}.txt`;
    const logFilePath = path.join(this.logFolder, logFileName);

    let logContent = 'Rate limit exceeded. Current requests:\n';
    this.requests.forEach(request => {
      logContent += `IP: ${request.ip}, Timestamp: ${new Date(request.timestamp).toISOString()}\n`;
    });

    fs.writeFile(logFilePath, logContent, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      } else {
        console.log(`Rate limit exceeded. Log file created: ${logFilePath}`);
      }
    });
  }
}

const logsFolder = path.join(__dirname, '..', 'logs');
export const globalRateLimiter = new GlobalSlidingWindowRateLimiter(60, 160, 5, 5, logsFolder);

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