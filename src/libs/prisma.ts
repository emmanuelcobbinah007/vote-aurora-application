import { PrismaClient } from "../generated/prisma";

// Declare global type for Prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a singleton instance of PrismaClient
export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({
    log: ["query", "error", "warn"],
    // Add connection management to prevent pool exhaustion
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// In development, save the instance for hot reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export as default for easy importing
export default prisma;
