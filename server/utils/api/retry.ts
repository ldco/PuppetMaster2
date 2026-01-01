/**
 * Retry Logic with Exponential Backoff and Circuit Breaker
 * Prevents cascading failures and provides resilience for external API calls
 */
import type { RetryConfig, CircuitBreakerConfig } from './types'

enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing - reject immediately
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export function useRetry(config: RetryConfig & { circuitBreaker?: CircuitBreakerConfig }) {
  let circuitState = CircuitState.CLOSED
  let failureCount = 0
  let nextAttemptAt: number | null = null

  /**
   * Execute function with retry and circuit breaker
   */
  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    // Circuit breaker check
    if (config.circuitBreaker?.enabled) {
      checkCircuit()
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
      try {
        const result = await fn()

        // Success - reset circuit breaker
        if (config.circuitBreaker?.enabled) {
          onSuccess()
        }

        return result
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const message = lastError.message

        // Don't retry if not retryable
        if (!isRetryable(error)) {
          console.warn('[Retry] Non-retryable error:', message)
          throw error
        }

        // Don't retry on last attempt
        if (attempt === config.maxAttempts - 1) {
          console.error(`[Retry] All ${config.maxAttempts} attempts failed for:`, message)
          break
        }

        // Wait before retry (exponential backoff)
        const delay = calculateDelay(attempt)
        console.warn(
          `[Retry] Attempt ${attempt + 1}/${config.maxAttempts} failed, retrying in ${delay}ms...`,
          message
        )
        await sleep(delay)
      }
    }

    // All retries failed
    if (config.circuitBreaker?.enabled) {
      onFailure()
    }

    throw lastError || new Error('Max retries exceeded')
  }

  /**
   * Check circuit breaker state before attempting request
   */
  function checkCircuit(): void {
    const now = Date.now()

    if (circuitState === CircuitState.OPEN) {
      // Check if we can attempt half-open (recovery test)
      if (nextAttemptAt && now >= nextAttemptAt) {
        console.log('[CircuitBreaker] Attempting recovery (HALF_OPEN)')
        circuitState = CircuitState.HALF_OPEN
        failureCount = 0
      } else {
        const waitTime = nextAttemptAt ? Math.round((nextAttemptAt - now) / 1000) : 0
        throw new Error(
          `[CircuitBreaker] Circuit is OPEN - service unavailable (retry in ${waitTime}s)`
        )
      }
    }
  }

  /**
   * Handle successful request
   */
  function onSuccess(): void {
    if (circuitState === CircuitState.HALF_OPEN) {
      console.log('[CircuitBreaker] Recovery successful - circuit CLOSED')
    }
    circuitState = CircuitState.CLOSED
    failureCount = 0
    nextAttemptAt = null
  }

  /**
   * Handle failed request
   */
  function onFailure(): void {
    if (!config.circuitBreaker) return

    failureCount++

    if (failureCount >= config.circuitBreaker.failureThreshold) {
      console.error(
        `[CircuitBreaker] Failure threshold reached (${failureCount}/${config.circuitBreaker.failureThreshold}) - opening circuit`
      )
      circuitState = CircuitState.OPEN
      nextAttemptAt = Date.now() + config.circuitBreaker.resetTimeout
    }
  }

  /**
   * Check if error is retryable
   */
  function isRetryable(error: unknown): boolean {
    if (!(error instanceof Error)) return false

    // Network errors are retryable
    if (error.name === 'FetchError' || error.name === 'AbortError') {
      return true
    }

    // Check for Node.js error codes
    const nodeError = error as Error & { code?: string }
    if (nodeError.code === 'ECONNREFUSED' || nodeError.code === 'ETIMEDOUT') {
      return true
    }

    // API errors with isRetryable flag or status
    const apiError = error as Error & { isRetryable?: boolean; status?: number }
    if (apiError.isRetryable !== undefined) {
      return apiError.isRetryable
    }

    // 5xx and 429 status codes are retryable
    if (apiError.status) {
      return apiError.status >= 500 || apiError.status === 429
    }

    return false
  }

  /**
   * Calculate delay with exponential backoff
   */
  function calculateDelay(attempt: number): number {
    const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt)
    return Math.min(delay, config.maxDelay)
  }

  /**
   * Sleep utility
   */
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current circuit breaker state
   */
  function getState() {
    return {
      circuitState,
      failureCount,
      nextAttemptAt: nextAttemptAt ? new Date(nextAttemptAt) : null
    }
  }

  /**
   * Reset circuit breaker (for testing/admin purposes)
   */
  function reset() {
    circuitState = CircuitState.CLOSED
    failureCount = 0
    nextAttemptAt = null
    console.log('[CircuitBreaker] Manual reset - circuit CLOSED')
  }

  return {
    execute,
    getState,
    reset
  }
}
