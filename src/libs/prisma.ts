import { PrismaClient } from "../generated/prisma";

// Declare global type for Prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prevent multiple instances of Prisma Client in development
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// In development, save the instance for hot reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export as default for easy importing
export default prisma;
