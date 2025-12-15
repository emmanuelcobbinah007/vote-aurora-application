import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis is configured
const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Fallback rate limiter that always allows requests when Redis is not configured
class NoOpRateLimiter {
  async limit(identifier: string) {
    console.warn("⚠️ Rate limiting disabled - Redis not configured");
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      pending: Promise.resolve(),
    };
  }
}

// OTP endpoints - strict (5 req/10min)
export const otpRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "@upstash/ratelimit:otp",
    })
  : new NoOpRateLimiter() as any;

// Authentication endpoints - moderate (10 req/15min)
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      prefix: "@upstash/ratelimit:auth",
    })
  : new NoOpRateLimiter() as any;

// Voting endpoints - lenient (100 req/hour)
export const voteRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      prefix: "@upstash/ratelimit:vote",
    })
  : new NoOpRateLimiter() as any;

// Results endpoints - moderate (30 req/min)
export const resultsRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "@upstash/ratelimit:results",
    })
  : new NoOpRateLimiter() as any;

// Admin actions - lenient (500 req/hour)
export const adminRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 h"),
      prefix: "@upstash/ratelimit:admin",
    })
  : new NoOpRateLimiter() as any;

// For backward compatibility - export the OTP limiter as default
export const rateLimit = otpRateLimit;

// Helper function to apply rate limiting
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    console.warn(`⚠️ Rate limit exceeded for ${identifier}`);
  }

  return { success, remaining };
}
