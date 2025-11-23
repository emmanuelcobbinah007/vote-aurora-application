import { PrismaClient } from "../generated/university-prisma";

const globalForUniversityPrisma = globalThis as unknown as {
  universityPrisma: any | undefined;
};

// Base client
const baseClient =
  globalForUniversityPrisma.universityPrisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// Create read-only wrapper with Prisma extension
export const universityPrisma = baseClient.$extends({
  name: "read-only-enforcement",
  query: {
    $allModels: {
      // Block all write operations
      async create() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
      async createMany() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
      async update() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
      async updateMany() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
      async upsert() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
      async delete() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
      async deleteMany() {
        throw new Error(
          "Write operations are not allowed on the university database. This is a read-only data source."
        );
      },
    },
  },
});

if (process.env.NODE_ENV !== "production")
  globalForUniversityPrisma.universityPrisma = baseClient;

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
