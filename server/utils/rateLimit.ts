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

// Login rate limiter (5 attempts per 15 minutes per IP)
// Stricter than contact form to prevent brute force
export const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000)

/**
 * Get client IP from H3 event
 * Handles proxies (X-Forwarded-For, X-Real-IP)
 */
export function getClientIp(event: any): string {
  // Try X-Forwarded-For first (for proxies/load balancers)
  const forwardedFor = event.node?.req?.headers?.['x-forwarded-for']
  if (forwardedFor) {
    // X-Forwarded-For can be comma-separated, first is original client
    const ip = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : forwardedFor[0]?.split(',')[0]?.trim()
    if (ip) return ip
  }

  // Try X-Real-IP (used by some proxies)
  const realIp = event.node?.req?.headers?.['x-real-ip']
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0]
  }

  // Fall back to socket address
  const socketAddress = event.node?.req?.socket?.remoteAddress
  if (socketAddress) return socketAddress

  return 'unknown'
}

