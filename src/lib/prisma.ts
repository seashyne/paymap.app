// src/lib/prisma.ts
// ─────────────────────────────────────────────────────────────────────────────
// Prisma Client Singleton
// Uses the standard Prisma Node client for stable Next.js build/runtime behavior.
// Guards against missing DATABASE_URL and hot-reload connection leaks.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "[prisma] DATABASE_URL is not defined. " +
        "Add it to your .env.local file or Vercel environment variables."
    );
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

// Reuse the client across hot reloads in development to prevent
// "Too many connections" errors.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
