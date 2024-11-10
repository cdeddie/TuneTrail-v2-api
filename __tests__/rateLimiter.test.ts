import { RateLimiter } from "../middleware/rateLimiter";
import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

describe('GlobalRateLimiter', () => {
  let rateLimiter: RateLimiter;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 10 * 1000,
      maxRequests: 10,
      userWarningThreshold: 30,
      userBlockThreshold: 70,
    });

    req = {
      ip: '127',
    };

    res = {
      setHeader: jest.fn<(name: string, value: string | number | readonly string[]) => Response>(),
      status: jest.fn<(code: number) => Response>().mockReturnThis(),
      json: jest.fn<(body: any) => Response>(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('allows requests within the limit', () => {
    const middleware = rateLimiter.middleware();

    for (let i = 0; i < 5; i++) {
      middleware(req as Request, res as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(5);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('blocks requests when the global limit is exceeded', () => {
    const middleware = rateLimiter.middleware();

    for (let i = 0; i < 10; i++) {
      middleware(req as Request, res as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(7);

    // After userBlockThreshold is exceeded, should return 429
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 10,  // windowMs / 1000
    });
  });

  test('sends warning header when user warning threshold is exceeded', () => {
    const middleware = rateLimiter.middleware();

    for (let i = 0; i < 4; i++) {
      middleware(req as Request, res as Response, next);
    }

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Warning', 'Suspicious activity detected');
  });

  test('blocks requests when user block threshold is exceeded', () => {
    const middleware = rateLimiter.middleware();

    for (let i = 0; i < 8; i++) {
      middleware(req as Request, res as Response, next);
    }

    // Next should be called 7 times (userBlockThreshold is 7)
    expect(next).toHaveBeenCalledTimes(7);

    // After userBlockThreshold is exceeded, should return 429
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 10,  // windowMs / 1000
    });
  });

  test('resets counts after windowMs time passes', () => {
    jest.useFakeTimers();
    const middleware = rateLimiter.middleware();

    for (let i = 0; i < 10; i++) {
      middleware(req as Request, res as Response, next);
    }

    // Should block after exceeding maxRequests
    expect(res.status).toHaveBeenCalledWith(429);

    // Advance time by windowMs (10 seconds)
    jest.advanceTimersByTime(10 * 1000);

    // Clear mocks to reset call counts
    jest.clearAllMocks();

    // Should allow requests again
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('handles multiple users independently', () => {
    const middleware = rateLimiter.middleware();
    const reqUser1 = { ip: '192.168.1.1' } as Request;
    const reqUser2 = { ip: '192.168.1.2' } as Request;

    // User 1 makes 5 requests
    for (let i = 0; i < 4; i++) {
      middleware(reqUser1, res as Response, next);
    }

    // User 2 makes 5 requests
    for (let i = 0; i < 4; i++) {
      middleware(reqUser2, res as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(8);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('blocks requests for user exceeding their limit, others unaffected', () => {
    const middleware = rateLimiter.middleware();
    const reqUser1 = { ip: '192.168.1.1' } as Request;
    const reqUser2 = { ip: '192.168.1.2' } as Request;

    // User 1 makes 7 requests
    for (let i = 0; i < 7; i++) {
      middleware(reqUser1, res as Response, next);
    }
    // 2 requests left

    // User 2 makes 5 requests
    for (let i = 0; i < 5; i++) {
      middleware(reqUser2, res as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(9);

    // User 1 should be blocked after 7 requests (userBlockThreshold)
    expect(res.status).toHaveBeenCalledWith(429);
  });
});