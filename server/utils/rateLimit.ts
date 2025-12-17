/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiting for API endpoints.
 * For production at scale, consider Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Create a rate limiter with configurable limits
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const rateLimitMap = new Map<string, RateLimitEntry>()

  /**
   * Check if request is within rate limit
   * @param key - Unique identifier (e.g., IP address)
   * @returns true if request is allowed, false if rate limited
   */
  function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    // No entry or window expired - allow and reset
    if (!entry || entry.resetAt < now) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }

    // Within window but at limit - deny
    if (entry.count >= limit) {
      return false
    }

    // Within window and under limit - allow and increment
    entry.count++
    return true
  }

  /**
   * Get remaining requests for a key
   */
  function getRemaining(key: string): number {
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    if (!entry || entry.resetAt < now) {
      return limit
    }

    return Math.max(0, limit - entry.count)
  }

  /**
   * Reset rate limit for a key (e.g., after successful captcha)
   */
  function reset(key: string): void {
    rateLimitMap.delete(key)
  }

  /**
   * Clear all rate limit entries (for testing)
   */
  function clear(): void {
    rateLimitMap.clear()
  }

  return {
    checkRateLimit,
    getRemaining,
    reset,
    clear
  }
}

// Default contact form rate limiter (5 per hour)
export const contactRateLimiter = createRateLimiter(5, 60 * 60 * 1000)

