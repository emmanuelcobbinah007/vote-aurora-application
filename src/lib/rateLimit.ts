import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// OTP endpoints - strict (5 req/10min)
export const otpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "@upstash/ratelimit:otp",
});

// Authentication endpoints - moderate (10 req/15min)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "@upstash/ratelimit:auth",
});

// Voting endpoints - lenient (100 req/hour)
export const voteRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  prefix: "@upstash/ratelimit:vote",
});

// Results endpoints - moderate (30 req/min)
export const resultsRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "@upstash/ratelimit:results",
});

// Admin actions - lenient (500 req/hour)
export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, "1 h"),
  prefix: "@upstash/ratelimit:admin",
});

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
