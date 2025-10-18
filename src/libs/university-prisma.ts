import { PrismaClient } from "../generated/university-prisma";

const globalForUniversityPrisma = globalThis as unknown as {
  universityPrisma: PrismaClient | undefined;
};

export const universityPrisma =
  globalForUniversityPrisma.universityPrisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
    datasources: {
      db: {
        url: process.env.UNIVERSITY_DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production")
  globalForUniversityPrisma.universityPrisma = universityPrisma;

// Helper function with timeout for database operations
export const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number = 10000 // Increased timeout
): Promise<T> => {
  return Promise.race([
    operation,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error(`Database operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

// Test connection function
export const testUniversityConnection = async () => {
  try {
    await universityPrisma.$connect();
    const result = await universityPrisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ University database connection successful");
    return true;
  } catch (error) {
    console.error("❌ University database connection failed:", error);
    return false;
  } finally {
    await universityPrisma.$disconnect();
  }
};

export default universityPrisma;
