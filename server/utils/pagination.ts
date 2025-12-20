/**
 * Database-Level Pagination Utility (HIGH-02)
 *
 * Provides efficient cursor-based and offset pagination
 * at the database level instead of in-memory.
 *
 * Usage:
 * const { items, meta } = await paginate(db.select().from(schema.users), {
 *   page: 1,
 *   limit: 20
 * })
 */
import { sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: number | string  // For cursor-based pagination
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    nextCursor?: number | string
  }
}

// Default and max limits
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(query.limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))
  const cursor = query.cursor as string | undefined
  const sortBy = query.sortBy as string | undefined
  const sortOrder = (query.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

  return { page, limit, cursor, sortBy, sortOrder }
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
  items: unknown[],
  cursorField?: string
): PaginatedResult<unknown>['meta'] {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const meta: PaginatedResult<unknown>['meta'] = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage
  }

  // Add next cursor for cursor-based pagination
  if (cursorField && items.length > 0 && hasNextPage) {
    const lastItem = items[items.length - 1] as Record<string, unknown>
    if (lastItem && cursorField in lastItem) {
      meta.nextCursor = lastItem[cursorField] as number | string
    }
  }

  return meta
}

/**
 * Apply pagination to a SQL query
 * Returns the SQL clauses to add (LIMIT and OFFSET)
 */
export function paginationClauses(page: number, limit: number): { limitClause: number; offsetClause: number } {
  return {
    limitClause: limit,
    offsetClause: calculateOffset(page, limit)
  }
}

/**
 * Create a count query SQL
 */
export function countSql(tableName: string, where?: SQL): SQL {
  if (where) {
    return sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE ${where}`
  }
  return sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`
}

/**
 * Example usage with Drizzle:
 *
 * // In your API handler:
 * const params = parsePaginationParams(getQuery(event))
 * const { limitClause, offsetClause } = paginationClauses(params.page!, params.limit!)
 *
 * const items = db
 *   .select()
 *   .from(schema.users)
 *   .limit(limitClause)
 *   .offset(offsetClause)
 *   .all()
 *
 * const [{ count }] = db
 *   .select({ count: sql`count(*)` })
 *   .from(schema.users)
 *   .all()
 *
 * return {
 *   items,
 *   meta: buildPaginationMeta(count, params.page!, params.limit!, items)
 * }
 */
