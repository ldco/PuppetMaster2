# Puppet Master - Prioritized Refactoring Roadmap

> **Status**: Planning Document
> **Created**: January 2026
> **Timeline**: 10 weeks estimated
> **Priority**: Deferred for future implementation

---

## Overview

This roadmap sequences all identified improvement areas by **risk level** and **business impact**, providing a systematic approach to refactoring the Puppet Master codebase. Each phase builds on previous work, minimizing disruption while maximizing value.

## Prioritization Framework

**Risk Assessment:**
- 🔴 **Critical** - Core infrastructure, widely used, high blast radius
- 🟡 **Moderate** - Important but contained, manageable blast radius
- 🟢 **Low** - Isolated code, minimal dependencies

**Impact Assessment:**
- ⭐⭐⭐ **High** - Significant improvement to maintainability, performance, or security
- ⭐⭐ **Medium** - Notable improvement, enables future work
- ⭐ **Low** - Nice-to-have, incremental improvement

---

## Current State Assessment

### Already Implemented ✅

| Item | Status | Location |
|------|--------|----------|
| Two-Factor Authentication (2FA) | ✅ Done | `server/api/user/2fa/*`, `server/utils/totp.ts` |
| Password Policy Enforcement | ✅ Done | `server/utils/password.ts` (validatePassword) |
| Rate Limiting (2FA + Login) | ✅ Done | `server/utils/rateLimit.ts` |
| CI/CD Pipeline | ✅ Done | `.github/workflows/ci.yml` (lint, test, build, deploy) |
| Code Coverage Reporting | ✅ Done | Codecov/Coveralls integration in CI |
| Sentry Error Tracking | ✅ Done | `server/plugins/sentry.ts`, `app/plugins/sentry.client.ts` |
| Security Headers | ✅ Done | `server/middleware/security-headers.ts` (includes Permissions-Policy) |
| Visual Regression Testing | ✅ Done | `e2e-playwright/visual-regression.spec.ts` |
| CHANGELOG.md | ✅ Done | `CHANGELOG.md` |
| CONTRIBUTING.md | ✅ Done | `CONTRIBUTING.md` |
| Backup Encryption | ✅ Done | `scripts/backup-db.sh` (AES-256-CBC) |
| API Versioning | ✅ Done | `server/middleware/api-version.ts` |

### Remaining Work

See detailed phases below.

---

## Phase 1: Foundation & Security (Weeks 1-3)

*Establish solid foundation before structural changes*

### 1.1 Session Rotation 🔴 ⭐⭐⭐

**Status**: Not Implemented

**Current State:**
- Sessions expire after 24h or 30 days (with "Remember Me")
- No automatic rotation during active use
- Session ID remains static until expiry

**Implementation:**

**Files to Modify:**
- `server/api/auth/session.get.ts` - Add rotation logic
- `server/api/auth/rotate.post.ts` - New endpoint
- `server/middleware/auth.ts` - Check session age
- `server/database/schema.ts` - Add `lastRotatedAt` field

**Steps:**
1. Add `lastRotatedAt` field to sessions table (migration)
2. On session validation, check if >1 hour since last rotation
3. If so, create new session ID, update cookie, delete old session
4. Rotation preserves user context but changes session ID

**Success Criteria:**
- Sessions rotate every 1 hour during active use
- Rotation is transparent to user (no re-login required)
- Old session IDs are immediately invalidated

---

### 1.2 IP Whitelisting for Admin 🟡 ⭐⭐⭐

**Status**: Not Implemented

**Current State:**
- Admin routes protected by role-based access only
- No IP-based restrictions
- IP is logged in audit logs but not enforced

**Implementation:**

**Files to Create/Modify:**
- `server/utils/ipWhitelist.ts` - New utility
- `server/middleware/auth.ts` - Add IP check for admin routes

**Steps:**
1. Create `ADMIN_IP_WHITELIST` env var (comma-separated IPs/CIDRs)
2. Parse whitelist on startup, cache parsed CIDRs
3. Add IP check in auth middleware for `/api/admin/*` routes
4. Log blocked attempts to audit log
5. Support wildcards (`*` for any) and CIDR notation (`192.168.1.0/24`)

**Configuration:**
```env
# Allow specific IPs only
ADMIN_IP_WHITELIST=192.168.1.100,10.0.0.0/8

# Allow all (default, no restriction)
ADMIN_IP_WHITELIST=*
```

**Success Criteria:**
- Non-whitelisted IPs get 403 on admin routes
- Blocked attempts are audit logged
- CIDR notation works correctly

---

### 1.3 Database Layer Optimization 🟡 ⭐⭐⭐

**Status**: Partial - Needs significant work

#### 1.3.1 Fix N+1 Query Issues

**Current State:**
- 13+ admin endpoints have O(n*m) in-memory lookups
- Pattern: Load all translations, then `.find()` per entity
- Affects: blog posts, team members, testimonials, features, FAQ, pricing

**Affected Endpoints:**
```
server/api/admin/blog/posts.get.ts
server/api/admin/team/index.get.ts
server/api/admin/testimonials/index.get.ts
server/api/admin/features/index.get.ts
server/api/admin/faq/index.get.ts
server/api/admin/pricing/index.get.ts
server/api/admin/clients/index.get.ts
server/api/portfolios/index.get.ts
(+ 5 more endpoints)
```

**Refactoring Pattern:**
```typescript
// BEFORE: O(n*m) in-memory lookups
const allTranslations = db.select().from(translations).where(...)
return posts.map(post => {
  const title = allTranslations.find(t => t.key === `post.${post.id}.title`)
  // More .find() calls per locale...
})

// AFTER: Pre-group by key for O(1) lookups
const allTranslations = db.select().from(translations).where(...)
const translationsByKey = groupBy(allTranslations, 'key')
return posts.map(post => {
  const title = translationsByKey[`post.${post.id}.title`]?.[0]
})
```

**Files to Create:**
- `server/utils/queryHelper.ts` - Batch query utilities

#### 1.3.2 Add Missing Indexes

**Current Indexes:** 27 (good coverage but gaps exist)

**Missing Indexes to Add:**
```sql
-- Translation lookups by locale+key pattern
CREATE INDEX translations_locale_key_idx ON translations(locale, key);

-- Timestamp-based pagination
CREATE INDEX blog_posts_created_idx ON blog_posts(created_at);
CREATE INDEX team_members_created_idx ON team_members(created_at);

-- Published items sorted by order
CREATE INDEX portfolios_published_order_idx ON portfolios(published, display_order);
CREATE INDEX features_published_order_idx ON features(published, display_order);
```

#### 1.3.3 Add Query Logging

**Files to Modify:**
- `server/database/client.ts` - Add query wrapper

**Implementation:**
```typescript
// Wrap db operations with timing
export function withQueryLogging<T>(operation: () => T, label: string): T {
  const start = performance.now()
  try {
    return operation()
  } finally {
    const duration = performance.now() - start
    if (duration > 100) {
      logger.warn({ duration, label }, 'Slow query detected')
    }
  }
}
```

**Success Criteria:**
- Query count reduced by 80%+ on admin list pages
- Slow queries (>100ms) are logged
- All new indexes applied via migration

---

## Phase 2: Code Structure & Maintainability (Weeks 4-6)

*Improve code organization and testability*

### 2.1 Configuration Refactoring 🟡 ⭐⭐⭐

**Status**: Not Implemented

**Current State:**
- Single 876-line `puppet-master.config.ts`
- TypeScript-only validation (no runtime checks)
- No environment variable overrides

**Target Structure:**
```
app/config/
├── index.ts          # Main export (orchestrator)
├── modules.ts        # 8 module definitions (185 lines)
├── settings.ts       # 50+ settings schema (167 lines)
├── features.ts       # Feature flags
├── admin.ts          # Admin panel config
├── colors.ts         # Brand colors
└── validation.ts     # Zod schemas for runtime validation
```

**Implementation:**

1. Create `app/config/` directory
2. Extract modules config (lines 109-293)
3. Extract settings schema (lines 628-814)
4. Add Zod validation for runtime config:
```typescript
// config/validation.ts
import { z } from 'zod'

export const featuresSchema = z.object({
  multiLangs: z.boolean().default(true),
  doubleTheme: z.boolean().default(true),
  // ...
})
```
5. Add env var overrides (`PM_FEATURE_MULTILANGS=false`)
6. Unified export from `app/config/index.ts`

**Success Criteria:**
- Config split into 6-8 focused modules
- Zod validation for all runtime config
- Env var overrides work correctly
- App starts with new config structure

---

### 2.2 Composables Refactoring 🟡 ⭐⭐

**Status**: Not Implemented

**Current State:**
- `useAuth.ts` is 296 lines
- Mixes session management, permission checking, and role hierarchy
- 11 functions doing different concerns

**Target Structure:**
```
app/composables/
├── auth/
│   ├── useAuthState.ts        # Reactive state (user, permissions, loading)
│   ├── useAuthSession.ts      # Login/logout/2FA operations
│   └── useAuthPermissions.ts  # Role/permission checks
└── useAuth.ts                 # Orchestrator (re-exports all)
```

**Splitting Strategy:**

| New File | Functions | Lines |
|----------|-----------|-------|
| `useAuthState.ts` | State declarations, computed properties | ~40 |
| `useAuthSession.ts` | checkSession, login, verify2fa, cancel2fa, logout | ~80 |
| `useAuthPermissions.ts` | canAccessPage, hasRole, getAssignableRoles, hasPermission | ~40 |
| `useAuth.ts` | Compose all three, export unified API | ~60 |

**Success Criteria:**
- No composable exceeds 100 lines
- Unit tests for each sub-composable
- Existing imports (`useAuth()`) continue to work

---

### 2.3 Admin Layout Refactoring 🟢 ⭐⭐

**Status**: Not Implemented

**Current State:**
- `admin.vue` is 427 lines
- User menu duplicated 3 times (DRY violation)
- No breadcrumbs, bulk actions, or global search

**Components to Extract:**

| Component | Current Lines | Description |
|-----------|---------------|-------------|
| `AdminUserMenu.vue` | ~40 (x3 copies) | Reusable user dropdown |
| `AdminHeader.vue` | ~77 | Horizontal header bar |
| `AdminSidebar.vue` | ~73 | Vertical sidebar nav |
| `AdminMobileHeader.vue` | ~52 | Mobile header with hamburger |
| `AdminBreadcrumbs.vue` | NEW | Route-based breadcrumbs |

**New Composable:**
- `useAdminNavigation.ts` - Extracts navigation logic (~30 lines)

**New Features to Add:**

1. **Breadcrumbs** - Based on route meta:
```vue
<AdminBreadcrumbs />
<!-- Shows: Admin > Users > Edit User -->
```

2. **Global Search** (Cmd+K):
```vue
<AdminCommandPalette />
<!-- Opens command palette for navigation/actions -->
```

3. **Keyboard Shortcuts**:
- `g h` - Go to home
- `g u` - Go to users
- `g s` - Go to settings
- `?` - Show keyboard shortcuts help

4. **Bulk Actions**:
- Select multiple items in list views
- Batch delete/publish/unpublish

**Success Criteria:**
- Layout under 150 lines
- User menu appears in one place (no duplication)
- Breadcrumbs on all admin pages
- Cmd+K command palette working
- 10+ keyboard shortcuts

---

## Phase 3: Performance & Optimization (Weeks 7-8)

*Optimize runtime performance and bundle size*

### 3.1 CSS Architecture Optimization 🟡 ⭐⭐

**Status**: Not Started

**Current State:**
- 50+ CSS files
- Some hardcoded values that should be variables
- PurgeCSS may not be optimally configured

**Implementation:**

1. **Audit CSS files** - Identify unused rules
2. **Extract critical CSS** for key pages (homepage, login, admin)
3. **Consolidate** similar files where appropriate
4. **Convert hardcoded values** to CSS variables
5. **Document browser support** for OKLCH and `light-dark()`
6. **Add CSS size budget** to CI:
```yaml
- name: Check CSS size
  run: |
    CSS_SIZE=$(du -b .output/public/_nuxt/*.css | awk '{sum += $1} END {print sum}')
    if [ $CSS_SIZE -gt 150000 ]; then
      echo "CSS bundle exceeds 150KB budget"
      exit 1
    fi
```

**Success Criteria:**
- CSS bundle reduced by 30%+
- Critical CSS extracted for 5+ key pages
- All colors use CSS variables
- Browser support documented

---

### 3.2 Performance Optimization 🟢 ⭐⭐

**Status**: Not Started

**Implementation:**

1. **Vue Error Boundaries**:
```vue
<!-- components/ErrorBoundary.vue -->
<script setup>
const error = ref(null)
onErrorCaptured((err) => {
  error.value = err
  return false // Don't propagate
})
</script>
<template>
  <div v-if="error" class="error-boundary">
    Something went wrong. <button @click="error = null">Retry</button>
  </div>
  <slot v-else />
</template>
```

2. **Bundle Analysis**:
```bash
npx nuxi analyze
```

3. **Strategic Prefetching**:
```vue
<NuxtLink to="/admin" prefetch>Admin</NuxtLink>
```

4. **HTTP Caching**:
```typescript
// server/middleware/cache.ts
export default defineEventHandler(event => {
  const path = event.path
  if (path.startsWith('/api/settings') || path.startsWith('/api/i18n')) {
    setHeader(event, 'Cache-Control', 'public, max-age=300')
  }
})
```

**Success Criteria:**
- Error boundaries on 5+ critical components
- Bundle size reduced by 20%+
- Lighthouse performance score 90+
- Cache headers on static API responses

---

## Phase 4: Developer Experience (Weeks 9-10)

*Improve development workflow and documentation*

### 4.1 TypeScript Enhancement 🟢 ⭐⭐

**Status**: Partial

**Implementation:**
1. Enable strict null checks in `tsconfig.json`
2. Add utility types for common patterns
3. Auto-generate types from Drizzle schema
4. Eliminate remaining `any` types

**Success Criteria:**
- 95%+ type coverage
- Zero `any` types in new code
- Strict null checks enabled

---

### 4.2 Documentation & Tooling 🟢 ⭐

**Status**: Partial (CHANGELOG exists)

**Implementation:**
1. Complete OpenAPI specification for all endpoints
2. Set up Storybook for component documentation
3. Add API documentation generator

**Success Criteria:**
- 100% API endpoint documentation
- Storybook for 20+ components

---

### 4.3 i18n Enhancement 🟢 ⭐

**Status**: Not Started

**Implementation:**
1. Add pluralization support
2. Implement context-specific translations
3. Build bulk translation export/import (CSV/JSON)

**Success Criteria:**
- Pluralization for 10+ strings
- CSV/JSON export/import working

---

## Implementation Timeline

```
Week 1-2: Phase 1 - Security & Database
├── Session rotation mechanism
├── IP whitelisting for admin
├── Database N+1 fixes (13 endpoints)
├── Add missing indexes
└── Query logging infrastructure

Week 3-4: Phase 2.1-2.2 - Config & Composables
├── Split config file into modules
├── Add Zod validation
├── Split useAuth composable
└── Add composable unit tests

Week 5-6: Phase 2.3 - Admin Layout
├── Extract admin layout components
├── Add breadcrumbs navigation
├── Add global search (Cmd+K)
├── Add keyboard shortcuts
└── Add bulk actions

Week 7-8: Phase 3 - Performance
├── CSS optimization & audit
├── Vue error boundaries
├── Bundle optimization
└── HTTP caching

Week 9-10: Phase 4 - Developer Experience
├── TypeScript improvements
├── OpenAPI completion
├── Storybook setup
└── i18n enhancements
```

---

## Success Metrics

### Code Quality
| Metric | Current | Target |
|--------|---------|--------|
| Test coverage | ~60% | 80%+ |
| Type coverage | ~85% | 95%+ |
| Linting errors | ~20 | 0 |
| Security vulnerabilities | 0 critical | 0 critical/high |

### Performance
| Metric | Current | Target |
|--------|---------|--------|
| Lighthouse score | ~75 | 90+ |
| Bundle size | ~800KB | 560KB (-30%) |
| CSS size | ~150KB | 105KB (-30%) |
| Query performance | baseline | +40% |

### Developer Experience
| Metric | Current | Target |
|--------|---------|--------|
| Build time | ~45s | 36s (-20%) |
| Test execution | ~12s | 8s (-30%) |
| Documentation coverage | ~60% | 100% |

---

## Risk Mitigation

### General Principles
- ✅ **Incremental commits** - Each sub-task is a separate commit
- ✅ **Feature flags** - Major changes behind flags
- ✅ **Test coverage** - Tests before refactoring
- ✅ **Rollback plan** - Git revert strategy for each phase

### High-Risk Areas
| Area | Risk | Mitigation |
|------|------|------------|
| Authentication/Security | Session rotation might break active sessions | Feature flag, gradual rollout |
| Database | Index creation on large tables | Run during low-traffic hours |
| Configuration | Config split might break imports | Maintain backward-compatible exports |
| Admin Layout | Component extraction might break styling | Visual regression tests |

---

## Next Steps

When ready to implement:

1. **Start with Phase 1.1** - Session rotation (highest security value)
2. **Follow the workflow** for each area:
   - Explore → Plan → Implement → Verify
3. **Create tickets** for each phase
4. **Track progress** in this document
5. **Adjust priorities** based on business needs

---

*Document created: January 2026*
*Last updated: January 2026*
*Status: Planning - Deferred for future implementation*
