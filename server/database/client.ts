/**
 * Database Client
 *
 * Singleton Drizzle client with better-sqlite3 driver.
 * Uses lazy initialization to avoid issues during build.
 */
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from './schema'

// Lazy singleton
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Get the database instance (lazy initialization)
 */
export function useDatabase() {
  if (!_db) {
    const config = useRuntimeConfig()
    const dbPath = config.databaseUrl || './data/sqlite.db'

    // Ensure data directory exists
    const dir = dirname(dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    const sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL')

    _db = drizzle(sqlite, { schema })
  }
  return _db
}

// Export for direct import in API routes
export const db = {
  get instance() {
    return useDatabase()
  }
}

// Re-export schema for convenience
export { schema }

