import { GlobalSlidingWindowRateLimiter } from "../middleware/rateLimiter";

describe('GlobalRateLimiter', () => {
  let rateLimiter: GlobalSlidingWindowRateLimiter;

  beforeEach(() => {
    rateLimiter = new GlobalSlidingWindowRateLimiter(10, 10, .5);
  });

  test('allows requests within the limit', async () => {
    for (let i = 0; i < 9; i++) {
      const result = rateLimiter.checkLimit('127');
      expect(result.allowed).toBe(true);
    }
  });
});