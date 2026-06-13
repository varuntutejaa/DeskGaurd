import { PrismaClient } from "@prisma/client";

// Single shared Prisma client for the process.
export const prisma = new PrismaClient({
  log: ["warn", "error"],
});
