/**
 * Prisma Client Singleton for Prisma ORM 7.x
 * 
 * This module provides a global singleton instance of PrismaClient that:
 * 1. Uses the @prisma/adapter-pg driver adapter (required in Prisma 7.x)
 * 2. Prevents connection pool exhaustion during hot-reload in development
 * 3. Can be imported anywhere including seed scripts
 * 4. Implements robust connection handling for Neon/Cloud Postgres (IPv4 resolution, SSL/SNI)
 * 
 * Usage:
 *   import { prisma } from '@/lib/prisma';
 *   // or for seed scripts:
 *   import { prisma } from '../src/lib/prisma';
 */
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { execSync } from "child_process";

// Global type declaration for the singleton
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPoolFixed: pg.Pool | undefined;
}

/**
 * Creates the PostgreSQL connection pool with proper SSL configuration
 * In Prisma 7, the pg adapter requires explicit SSL settings for cloud databases
 * Uses synchronous DNS resolution to ensure IPv4 is used.
 */
function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Make sure you have a .env file with DATABASE_URL defined."
    );
  }

  // Parse URL to get components
  const url = new URL(connectionString);
  const hostname = url.hostname;
  
  let resolvedIp = hostname;
  try {
    // Resolve hostname to IPv4 synchronously to bypass Node's IPv6 preference issues
    // This is robust for environments where IPv6 is flaky or preferred but unreachable
    // 'getent ahostsv4' works reliably on Linux systems
    const output = execSync(`getent ahostsv4 ${hostname}`).toString();
    const match = output.match(/\b([0-9]{1,3}\.){3}[0-9]{1,3}\b/);
    if (match) {
      resolvedIp = match[0];
      // console.log(`[Prisma] Resolved ${hostname} to ${resolvedIp}`);
    }
  } catch (e) {
    console.warn(`[Prisma] Failed to resolve ${hostname} manually, falling back to system resolution`);
  }

  // Check if the connection string indicates SSL is required (Neon, Supabase, etc.)
  const requiresSsl = connectionString.includes('sslmode=require') || 
                      connectionString.includes('.neon.tech') ||
                      connectionString.includes('.supabase.') ||
                      connectionString.includes('.render.com');

  return new pg.Pool({
    user: url.username,
    password: url.password,
    host: resolvedIp,
    port: parseInt(url.port || "5432"),
    database: url.pathname.slice(1),
    // Crucial: We must set servername for SNI to work with the IP address
    ssl: requiresSsl ? { 
      rejectUnauthorized: false,
      servername: hostname 
    } : undefined,
    // Configure pool for development vs production
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
}

/**
 * Creates and configures the Prisma Client with the pg adapter
 */
function createPrismaClient(): PrismaClient {
  // Reuse existing pool or create new one
  if (!global.__pgPoolFixed) {
    global.__pgPoolFixed = createPool();
  }
  
  const adapter = new PrismaPg(global.__pgPoolFixed);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" 
      ? ["warn", "error"] 
      : ["error"],
  });
}

/**
 * The global Prisma Client singleton
 * In development, we reuse the instance across hot reloads
 * In production, we create a fresh instance
 */
export const prisma: PrismaClient = 
  global.__prismaClient ?? createPrismaClient();

// Store the singleton in globalThis for development hot-reload
if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = prisma;
}

/**
 * Graceful shutdown helper - call this when you need to cleanly disconnect
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  if (global.__pgPoolFixed) {
    await global.__pgPoolFixed.end();
    global.__pgPoolFixed = undefined;
  }
  global.__prismaClient = undefined;
}
