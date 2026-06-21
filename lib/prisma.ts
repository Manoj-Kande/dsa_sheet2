// ============================================
// Prisma client singleton — Neon serverless adapter
// Without this adapter, every serverless invocation opens a raw
// connection and exhausts Neon's connection limit under real traffic.
// ============================================
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required in non-edge Node.js runtimes (e.g. Vercel serverless functions)
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Neon connection string."
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
