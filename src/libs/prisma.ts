import { PrismaClient } from "../generated/prisma";

// Declare global type for Prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const SLOW_QUERY_THRESHOLD = 1000; // 1 second

// Prevent multiple instances of Prisma Client in development
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });

// Track slow queries
prisma.$on("query" as never, (e: any) => {
  if (e.duration > SLOW_QUERY_THRESHOLD) {
    console.warn(`🐌 Slow Query Detected (${e.duration}ms):`, {
      query: e.query.substring(0, 200), // First 200 chars
      params: e.params,
      duration: e.duration,
      timestamp: new Date().toISOString(),
    });
    
    // In production with Sentry, this would be captured
    if (process.env.NODE_ENV === "production") {
      // Sentry.captureMessage will be added when Sentry is configured
      console.error("SLOW_QUERY", {
        duration: e.duration,
        query: e.query.substring(0, 500),
      });
    }
  }
});

// Track errors
prisma.$on("error" as never, (e: any) => {
  console.error("❌ Prisma Error:", e);
  
  if (process.env.NODE_ENV === "production") {
    // Sentry.captureException will be added when Sentry is configured
    console.error("PRISMA_ERROR", e);
  }
});

// Track warnings
prisma.$on("warn" as never, (e: any) => {
  console.warn("⚠️ Prisma Warning:", e);
});

// In development, save the instance for hot reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export as default for easy importing
export default prisma;
