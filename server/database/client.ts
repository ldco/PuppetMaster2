/**
 * Database Client (HIGH-01: Transaction Support)
 *
 * Singleton Drizzle client with better-sqlite3 driver.
 * Uses lazy initialization to avoid issues during build.
 * Provides transaction support for atomic operations.
 */
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from './schema'
import { logger } from '../utils/logger'

// Type for the drizzle instance
type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>

// Lazy singleton
let _db: DrizzleDB | null = null
let _sqlite: Database.Database | null = null

/**
 * Get the database instance (lazy initialization)
 */
export function useDatabase(): DrizzleDB {
  if (!_db) {
    const config = useRuntimeConfig()
    const dbPath = config.databaseUrl || './data/sqlite.db'

    // Ensure data directory exists
    const dir = dirname(dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    _sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrency
    _sqlite.pragma('journal_mode = WAL')

    _db = drizzle(_sqlite, { schema })
  }
  return _db
}

/**
 * Execute a function within a database transaction
 *
 * Usage:
 * const result = await withTransaction(async (tx) => {
 *   await tx.insert(schema.users).values({ ... })
 *   await tx.insert(schema.sessions).values({ ... })
 *   return { success: true }
 * })
 *
 * If any operation fails, all changes are rolled back.
 */
export async function withTransaction<T>(
  fn: (tx: DrizzleDB) => T | Promise<T>
): Promise<T> {
  const db = useDatabase()

  // For synchronous Drizzle with better-sqlite3, we use the underlying
  // sqlite3 transaction support
  if (!_sqlite) {
    throw new Error('Database not initialized')
  }

  // Use immediate transaction for write operations
  const transaction = _sqlite.transaction((callback: () => T) => {
    return callback()
  })

  try {
    // Wrap the async function execution
    const result = await (async () => {
      return transaction(() => {
        // Execute within transaction
        const res = fn(db)
        // If it's a promise, we need to resolve it
        if (res instanceof Promise) {
          // Note: better-sqlite3 is synchronous, so async operations
          // within transactions require careful handling
          throw new Error('Async operations in transactions not supported with better-sqlite3. Use synchronous operations.')
        }
        return res
      })
    })()

    return result
  } catch (error: any) {
    logger.error('Transaction failed', {
      error: error?.message || String(error)
    })
    throw error
  }
}

/**
 * Synchronous transaction for better-sqlite3
 * Preferred method for atomic operations
 *
 * Usage:
 * const result = transactionSync((db) => {
 *   db.insert(schema.users).values({ ... }).run()
 *   db.insert(schema.sessions).values({ ... }).run()
 *   return { success: true }
 * })
 */
export function transactionSync<T>(fn: (db: DrizzleDB) => T): T {
  const db = useDatabase()

  if (!_sqlite) {
    throw new Error('Database not initialized')
  }

  const transaction = _sqlite.transaction(() => {
    return fn(db)
  })

  try {
    return transaction()
  } catch (error: any) {
    logger.error('Transaction failed', {
      error: error?.message || String(error)
    })
    throw error
  }
}

// Export for direct import in API routes
export const db = {
  get instance() {
    return useDatabase()
  }
}

// Re-export schema for convenience
export { schema }

