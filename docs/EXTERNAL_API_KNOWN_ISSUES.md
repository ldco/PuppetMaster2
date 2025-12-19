# External API Infrastructure - Known Issues

**Status:** ✅ All documented issues have been fixed
**Last Updated:** 2025-12-19

---

## Overview

The external API infrastructure (`server/utils/api/`) is production-ready. All previously identified issues have been resolved.

---

## ✅ Issue #1: Token Refresh Race Condition (FIXED)

**File:** `server/utils/api/auth.ts`

**Problem:** If multiple requests arrive simultaneously when the OAuth token is expired, all of them will trigger separate `refreshToken()` calls, causing:
- Multiple token requests to the OAuth server
- Potential rate limiting
- Wasted network resources

**Solution Implemented:** Added shared promise deduplication pattern

**Implementation:**
```typescript
let refreshPromise: Promise<void> | null = null

async function getToken(): Promise<string | null> {
  // ... type checks ...

  if (config.type === 'oauth2') {
    // Refresh if no token or expiring soon
    if (!currentToken || !tokenExpiresAt || tokenExpiresAt <= refreshThreshold) {
      // Deduplicate concurrent refresh calls using shared promise
      if (!refreshPromise) {
        refreshPromise = refreshToken().finally(() => {
          refreshPromise = null
        })
      }
      await refreshPromise
    }
    return currentToken
  }
}
```

**Result:** Multiple concurrent requests now wait for a single token refresh operation. The promise is cleared after completion via `.finally()` to allow future refreshes.

---

## ✅ Issue #2: Per-Resource TTL Not Auto-Applied (FIXED)

**File:** `server/utils/api/client.ts`

**Problem:** The config defines per-resource cache TTLs, but callers had to manually specify them:

```typescript
// Config defines TTLs
cache.ttl.portfolio = 180

// But every call needed manual TTL
apiClient.get('/portfolio', { cache: { ttl: 180 } })  // Repetitive!
```

**Solution Implemented:** Added `getResource()` method with automatic TTL lookup

**Implementation:**
```typescript
getResource<T>(
  resource: keyof typeof config.dataSource.api.cache.ttl,
  path: string,
  options?: Omit<APIRequestOptions, 'body' | 'cache'>
): Promise<T> {
  const ttl = config.dataSource.api.cache.ttl[resource] ?? 300
  return this.get<T>(path, {
    ...options,
    cache: ttl > 0 ? { ttl } : undefined,
  })
}
```

**Usage Examples:**
```typescript
// Automatic TTL from config (180s for portfolio)
await apiClient.getResource('portfolio', '/portfolio')

// No cache for contacts (ttl: 0 in config)
await apiClient.getResource('contacts', '/contacts')

// TypeScript autocomplete ensures correct resource names
await apiClient.getResource('users', '/users')  // ✅ Type-safe
await apiClient.getResource('invalid', '/foo')  // ❌ Compile error
```

**Result:** Type-safe, DRY API calls with automatic cache configuration. Manual `get()` method still available for custom TTLs.

---

## ✅ Issue #3: Singleton Initialization Race (FIXED)

**File:** `server/utils/api/client.ts`

**Problem:** Classic "check-then-act" race condition where concurrent first requests could create multiple instances:

```typescript
// Before fix
if (apiClient) return apiClient  // ← Check
// Another request could arrive here
apiClient = new APIClient(...)   // ← Act (duplicate instance)
```

**Solution Implemented:** Added initialization guard flag with try-finally pattern

**Implementation:**
```typescript
let apiClient: APIClient | null = null
let isInitializing = false

export function useAPIClient(): APIClient {
  // Return existing instance if available
  if (apiClient) return apiClient

  // Prevent concurrent initialization (defensive programming)
  if (isInitializing) {
    throw new Error('[APIClient] Concurrent initialization detected')
  }

  isInitializing = true

  try {
    const runtimeConfig = useRuntimeConfig()
    apiClient = new APIClient({ /* ... */ })
    console.log(`[APIClient] Initialized with baseUrl: ${runtimeConfig.apiBaseUrl}`)
    return apiClient
  } finally {
    isInitializing = false
  }
}
```

**Result:**
- Initialization is now atomic (protected by flag)
- If concurrent initialization somehow occurs, it throws an error for debugging
- Flag is always reset via `finally` block, even on errors
- Extremely unlikely to trigger in production (Node.js is single-threaded)

---

## ✅ What's Working Well

| Component | Status |
|-----------|--------|
| Circuit breaker state machine | ✅ Correct implementation |
| Exponential backoff algorithm | ✅ Correct math with max cap |
| Memory leak prevention | ✅ HMR + process signal cleanup |
| Type definitions | ✅ Complete and accurate |
| Retryable error detection | ✅ Smart (5xx, 429, network errors) |
| Cache expiry cleanup | ✅ Automatic 5-min interval |
| Documentation | ✅ Comprehensive |

---

## Future Enhancements (from EXTERNAL_API.md)

These are already documented in the main file but listed here for reference:

1. **Redis Cache Support** - For multi-instance deployments
2. **Request Deduplication** - Coalesce simultaneous identical requests
3. **Repository Pattern** - Fully abstract data layer when needed
4. **Health Monitoring UI** - Admin panel for circuit breaker / cache stats
5. **Metrics Endpoint** - Prometheus-compatible metrics

---

## ✅ All Issues Resolved

All three documented issues have been fixed:

| Issue | Status | Date Fixed |
|-------|--------|------------|
| #1 Token Refresh Race | ✅ Fixed | 2025-12-19 |
| #2 Per-Resource TTL | ✅ Fixed | 2025-12-19 |
| #3 Singleton Init Race | ✅ Fixed | 2025-12-19 |

**Production Ready:** The external API infrastructure is now fully production-ready with no known issues.

---

*This document is kept for historical reference. All issues have been resolved.*

