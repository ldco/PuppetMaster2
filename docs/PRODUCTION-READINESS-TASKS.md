# PuppetMaster2 - Production Readiness Tasks

> Generated from Full Team Review on 2024-12-20
> Status: Pre-Production | Target: Production-Ready Framework

---

## Table of Contents

1. [Overview](#overview)
2. [Task Summary](#task-summary)
3. [Critical Tasks](#critical-tasks-block-production)
4. [High Priority Tasks](#high-priority-tasks)
5. [Medium Priority Tasks](#medium-priority-tasks)
6. [Low Priority Tasks](#low-priority-tasks)
7. [Post-Implementation: Kamal Deployment](#post-implementation-kamal-deployment)
8. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)

---

## Overview

### Current State
PuppetMaster2 is approximately **80% production-ready**. The framework has:
- Excellent CSS architecture (5-layer system, no scoped styles)
- Solid TypeScript implementation with Drizzle ORM
- Thoughtful UX design (dual-mode, atomic components)
- Good password security (scrypt, timing-safe comparison)

### Blocking Issues
The remaining **20%** consists primarily of:
- Security hardening (CSRF, headers, rate limiting)
- DevOps infrastructure (Dockerfile, logging, monitoring)
- Backend optimizations (transactions, pagination)
- UX polish (loading states, empty states)

### Implementation Order
1. **CRITICAL** - Must fix before any production deployment
2. **HIGH** - Should fix before client deployments
3. **MEDIUM** - Fix when time permits
4. **LOW** - Future enhancements
5. **KAMAL** - Configure after all fixes complete

---

## Task Summary

| Priority | Count | Categories |
|----------|-------|------------|
| CRITICAL | 7 | Security (5), DevOps (2) |

---

## Tasks by Team Member

### 🔒 Yuki (Security Engineer)
| Task ID | Priority | Description | Status |
|---------|----------|-------------|--------|
| CRIT-01 | CRITICAL | CSRF token validation | [x] DONE |
| CRIT-02 | CRITICAL | Security headers middleware | [x] DONE |
| CRIT-03 | CRITICAL | Login rate limiting | [x] DONE |
| CRIT-04 | CRITICAL | Account lockout | [x] DONE |
| CRIT-05 | CRITICAL | File upload validation (magic bytes) | [x] DONE |
| HIGH-04 | HIGH | Audit logging for auth/role changes | [x] DONE |
| HIGH-09 | HIGH | HTML sanitization (DOMPurify) | [x] DONE |
| HIGH-10 | HIGH | Upgrade SameSite cookie to strict | [x] DONE |

### 🚀 Dmitri (DevOps Engineer)
| Task ID | Priority | Description | Status |
|---------|----------|-------------|--------|
| CRIT-06 | CRITICAL | Create Dockerfile | [x] DONE |
| CRIT-07 | CRITICAL | Configure Kamal | [x] DONE |
| HIGH-03 | HIGH | Structured logging (Pino) | [x] DONE |
| HIGH-08 | HIGH | Environment variable validation | [x] DONE |
| MED-01 | MEDIUM | Public health check endpoint | [x] DONE |
| MED-02 | MEDIUM | Scheduled session cleanup | [x] DONE |
| LOW-01 | LOW | Redis for distributed rate limiting | [ ] |
| LOW-03 | LOW | APM and metrics endpoint | [ ] |

### ⚙️ Viktor (Backend Engineer)
| Task ID | Priority | Description | Status |
|---------|----------|-------------|--------|
| HIGH-01 | HIGH | Database transactions | [x] DONE |
| HIGH-02 | HIGH | DB-level pagination | [x] DONE |
| MED-03 | MEDIUM | Optimistic locking | [x] DONE |
| LOW-02 | LOW | Database encryption (SQLCipher) | [ ] |
| LOW-06 | LOW | GDPR data retention | [ ] |

### 🎨 Maya (Frontend Engineer)
| Task ID | Priority | Description | Status |
|---------|----------|-------------|--------|
| HIGH-05 | HIGH | Accessibility testing (axe-core) | [x] DONE |
| HIGH-06 | HIGH | Loading skeleton components | [x] DONE |
| MED-04 | MEDIUM | Reduced motion support | [x] DONE |

### 🎯 Sofia (UX Specialist)
| Task ID | Priority | Description | Status |
|---------|----------|-------------|--------|
| HIGH-07 | HIGH | Empty states design | [x] DONE |
| LOW-04 | LOW | Keyboard shortcuts in admin | [ ] |
| LOW-05 | LOW | Onboarding wizard | [x] DONE |
| HIGH | 10 | Backend (4), Security (3), Frontend (2), DevOps (1) |
| MEDIUM | 4 | Backend (2), DevOps (1), Frontend (1) |
| LOW | 6 | Backend (2), DevOps (2), UX (2) |
| **Total** | **27** | |

---

## Critical Tasks (Block Production)

### CRIT-01: Add CSRF Token Validation

**Category:** Security
**Owner:** Backend
**Effort:** Medium (4-6 hours)
**Status:** [x] COMPLETED (2024-12-20)

#### Problem
Currently only using `SameSite: lax` cookies for CSRF protection. This is insufficient because:
- Lax allows cross-site form submissions in some cases
- No explicit CSRF token validation
- State-changing POST requests could be exploited

#### Solution
Implement double-submit cookie pattern:
1. Generate CSRF token on session creation
2. Store token in HTTP-only cookie AND send in response header
3. Client includes token in `X-CSRF-Token` header on mutations
4. Server validates token matches cookie

#### Implementation

**Files to create/modify:**
- `server/utils/csrf.ts` - CSRF token generation and validation
- `server/middleware/csrf.ts` - CSRF validation middleware
- `app/composables/useCsrf.ts` - Client-side CSRF token handling
- `app/plugins/csrf.client.ts` - Auto-inject CSRF header in fetch

**Server-side (`server/utils/csrf.ts`):**
```typescript
import { randomBytes } from 'crypto'
import type { H3Event } from 'h3'

const CSRF_COOKIE_NAME = 'pm-csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

export function setCsrfCookie(event: H3Event, token: string): void {
  setCookie(event, CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })
}

export function validateCsrfToken(event: H3Event): boolean {
  const cookieToken = getCookie(event, CSRF_COOKIE_NAME)
  const headerToken = getHeader(event, CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) return false

  // Timing-safe comparison
  return timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}
```

**Middleware (`server/middleware/csrf.ts`):**
```typescript
export default defineEventHandler((event) => {
  // Skip for GET, HEAD, OPTIONS
  const method = event.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return

  // Skip for non-API routes
  if (!event.path.startsWith('/api/')) return

  // Skip for login (no session yet)
  if (event.path === '/api/auth/login') return

  if (!validateCsrfToken(event)) {
    throw createError({
      statusCode: 403,
      message: 'Invalid CSRF token'
    })
  }
})
```

#### Acceptance Criteria
- [ ] CSRF token generated on login
- [ ] Token stored in HTTP-only cookie
- [ ] Token returned in response header for client storage
- [ ] All POST/PUT/DELETE requests validate CSRF token
- [ ] Invalid/missing token returns 403
- [ ] Tests cover CSRF validation

---

### CRIT-02: Add Security Headers Middleware

**Category:** Security
**Owner:** Yuki (Security Engineer)
**Effort:** Low (2-3 hours)
**Status:** [x] COMPLETED (2024-12-20)

#### Problem
No explicit security headers configured. Missing:
- Content-Security-Policy (XSS protection)
- Strict-Transport-Security (HTTPS enforcement)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Referrer-Policy (referrer leakage)
- Permissions-Policy (feature restrictions)

#### Solution
Create server middleware that adds security headers to all responses.

#### Implementation

**File to create:** `server/middleware/security-headers.ts`

```typescript
export default defineEventHandler((event) => {
  const headers = event.node.res

  // Prevent clickjacking
  headers.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // Control referrer information
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // HTTPS enforcement (1 year)
  if (process.env.NODE_ENV === 'production') {
    headers.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Content Security Policy
  headers.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for Vue
    "style-src 'self' 'unsafe-inline'", // Required for Vue
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '))

  // Permissions Policy
  headers.setHeader('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()'
  ].join(', '))
})
```

#### Configuration
Add to `nuxt.config.ts` if middleware doesn't auto-register:
```typescript
nitro: {
  handlers: [
    { route: '/**', handler: '~/server/middleware/security-headers.ts' }
  ]
}
```

#### Acceptance Criteria
- [ ] All responses include security headers
- [ ] CSP doesn't break Vue/Nuxt functionality
- [ ] HSTS only in production
- [ ] Headers verified with securityheaders.com
- [ ] No console errors from CSP violations

---

### CRIT-03: Add Rate Limiting on Login Endpoint

**Category:** Security
**Owner:** Yuki (Security Engineer)
**Effort:** Low (1-2 hours)
**Status:** [x] COMPLETED (2024-12-20)

#### Problem
No rate limiting on `/api/auth/login`. Attackers can:
- Brute force passwords
- Credential stuffing attacks
- No protection against automated attacks

#### Solution
Apply rate limiting to login endpoint using existing rate limiter infrastructure.

#### Implementation

**Modify:** `server/api/auth/login.post.ts`

```typescript
import { createRateLimiter } from '~/server/utils/rateLimit'

// 5 attempts per 15 minutes per IP
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000)

export default defineEventHandler(async (event) => {
  // Rate limit check
  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getHeader(event, 'x-real-ip')
    || 'unknown'

  const rateLimitResult = loginRateLimiter.check(ip)
  if (!rateLimitResult.allowed) {
    throw createError({
      statusCode: 429,
      message: `Too many login attempts. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`
    })
  }

  // ... existing login logic ...
})
```

#### Considerations
- Rate limit by IP (current implementation)
- Consider rate limit by username as well (prevents distributed attacks on single account)
- Log rate limit events for monitoring

#### Acceptance Criteria
- [ ] Login limited to 5 attempts per 15 minutes per IP
- [ ] 429 response with retry-after information
- [ ] Rate limit resets after window expires
- [ ] Successful login doesn't consume rate limit
- [ ] Tests cover rate limiting behavior

---

### CRIT-04: Implement Account Lockout After Failed Attempts

**Category:** Security
**Owner:** Yuki (Security Engineer)
**Effort:** Medium (3-4 hours)
**Status:** [x] COMPLETED (2024-12-20)

#### Problem
Even with rate limiting, persistent attackers can:
- Wait out rate limit windows
- Use distributed IPs
- Continue brute force over time

#### Solution
Implement account-level lockout after N failed attempts.

#### Implementation

**1. Add to schema (`server/database/schema.ts`):**
```typescript
export const users = sqliteTable('users', {
  // ... existing fields ...
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: integer('locked_until', { mode: 'timestamp' }),
  lastFailedLogin: integer('last_failed_login', { mode: 'timestamp' }),
})
```

**2. Create lockout utility (`server/utils/accountLockout.ts`):**
```typescript
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const ATTEMPT_RESET_MS = 60 * 60 * 1000 // 1 hour

export async function checkAccountLocked(userId: number): Promise<boolean> {
  const user = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get()

  if (!user?.lockedUntil) return false

  if (new Date() > user.lockedUntil) {
    // Lockout expired, reset
    await resetFailedAttempts(userId)
    return false
  }

  return true
}

export async function recordFailedAttempt(userId: number): Promise<{ locked: boolean; attemptsRemaining: number }> {
  const user = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get()

  // Reset attempts if last failure was over an hour ago
  const attempts = shouldResetAttempts(user) ? 1 : (user.failedLoginAttempts || 0) + 1

  const updates: Partial<typeof schema.users.$inferInsert> = {
    failedLoginAttempts: attempts,
    lastFailedLogin: new Date()
  }

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
  }

  await db.update(schema.users)
    .set(updates)
    .where(eq(schema.users.id, userId))

  return {
    locked: attempts >= MAX_FAILED_ATTEMPTS,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - attempts)
  }
}

export async function resetFailedAttempts(userId: number): Promise<void> {
  await db.update(schema.users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLogin: null
    })
    .where(eq(schema.users.id, userId))
}
```

**3. Integrate with login (`server/api/auth/login.post.ts`):**
```typescript
// After finding user, before password check
if (await checkAccountLocked(user.id)) {
  throw createError({
    statusCode: 423,
    message: 'Account temporarily locked due to too many failed attempts. Try again later.'
  })
}

// On failed password
const lockoutResult = await recordFailedAttempt(user.id)
if (lockoutResult.locked) {
  throw createError({
    statusCode: 423,
    message: 'Account locked due to too many failed attempts. Try again in 30 minutes.'
  })
}

// On successful login
await resetFailedAttempts(user.id)
```

#### Acceptance Criteria
- [ ] Account locks after 5 failed attempts
- [ ] Lockout lasts 30 minutes
- [ ] Failed attempts reset after 1 hour of no attempts
- [ ] Successful login resets failed attempts
- [ ] Locked account returns 423 status
- [ ] Admin can manually unlock accounts
- [ ] Database migration added for new fields

---

### CRIT-05: Validate File Uploads by Magic Bytes

**Category:** Security
**Owner:** Backend
**Effort:** Medium (3-4 hours)
**Status:** [ ] Not Started

#### Problem
Current implementation trusts client-provided MIME type:
```typescript
const mimeType = file.type || ''
```

Attackers can:
- Upload malicious files with fake MIME types
- Bypass file type restrictions
- Execute polyglot attacks

#### Solution
Validate actual file content using magic bytes (file signatures).

#### Implementation

**1. Install dependency:**
```bash
npm install file-type
```

**2. Create validation utility (`server/utils/fileValidation.ts`):**
```typescript
import { fileTypeFromBuffer } from 'file-type'

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
])

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime'
])

export async function validateImageFile(buffer: Buffer): Promise<{
  valid: boolean
  detectedType: string | null
  error?: string
}> {
  const detected = await fileTypeFromBuffer(buffer)

  if (!detected) {
    return { valid: false, detectedType: null, error: 'Could not detect file type' }
  }

  if (!ALLOWED_IMAGE_TYPES.has(detected.mime)) {
    return {
      valid: false,
      detectedType: detected.mime,
      error: `File type ${detected.mime} not allowed. Allowed: ${[...ALLOWED_IMAGE_TYPES].join(', ')}`
    }
  }

  return { valid: true, detectedType: detected.mime }
}

export async function validateVideoFile(buffer: Buffer): Promise<{
  valid: boolean
  detectedType: string | null
  error?: string
}> {
  const detected = await fileTypeFromBuffer(buffer)

  if (!detected) {
    return { valid: false, detectedType: null, error: 'Could not detect file type' }
  }

  if (!ALLOWED_VIDEO_TYPES.has(detected.mime)) {
    return {
      valid: false,
      detectedType: detected.mime,
      error: `File type ${detected.mime} not allowed. Allowed: ${[...ALLOWED_VIDEO_TYPES].join(', ')}`
    }
  }

  return { valid: true, detectedType: detected.mime }
}
```

**3. Modify upload endpoints:**

`server/api/upload/image.post.ts`:
```typescript
import { validateImageFile } from '~/server/utils/fileValidation'

// After reading file buffer
const validation = await validateImageFile(buffer)
if (!validation.valid) {
  throw createError({
    statusCode: 400,
    message: validation.error
  })
}

// Use detected type instead of client-provided
const mimeType = validation.detectedType
```

#### Acceptance Criteria
- [ ] All uploads validated by magic bytes
- [ ] Client MIME type ignored in favor of detected type
- [ ] Invalid files rejected with clear error message
- [ ] Polyglot files detected and rejected
- [ ] Tests cover various file type scenarios
- [ ] Performance impact acceptable (< 50ms overhead)

---

### CRIT-06: Create Dockerfile for Nuxt App

**Category:** DevOps
**Owner:** DevOps
**Effort:** Medium (3-4 hours)
**Status:** [ ] Not Started

#### Problem
No Dockerfile exists. Cannot:
- Deploy to container platforms
- Use Kamal for deployment
- Ensure consistent environments

#### Solution
Create multi-stage Dockerfile optimized for Nuxt 3.

#### Implementation

**File to create:** `Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --include=dev

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    libc6-compat \
    ffmpeg \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxt:nodejs /app/package.json ./package.json

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nuxt:nodejs /app/data

# Create uploads directory
RUN mkdir -p /app/public/uploads && chown nuxt:nodejs /app/public/uploads

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=/app/data/sqlite.db

# Switch to non-root user
USER nuxt

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
```

**File to create:** `.dockerignore`

```
# Dependencies
node_modules
.pnpm-store

# Build outputs
.output
.nuxt
dist

# Development
.git
.gitignore
*.md
docs/

# Environment
.env
.env.*
!.env.example

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test
coverage
*.test.ts
tests/

# Data
data/
*.db
*.sqlite

# Uploads (optional - may want to persist)
public/uploads/*
!public/uploads/.gitkeep
```

#### Build and Test
```bash
# Build image
docker build -t puppetmaster2:latest .

# Run container
docker run -d \
  --name puppetmaster2 \
  -p 3000:3000 \
  -v pm2-data:/app/data \
  -v pm2-uploads:/app/public/uploads \
  -e DATABASE_URL=/app/data/sqlite.db \
  puppetmaster2:latest

# Check logs
docker logs puppetmaster2

# Test health
curl http://localhost:3000/api/health
```

#### Acceptance Criteria
- [ ] Dockerfile builds successfully
- [ ] Multi-stage build keeps image small (< 500MB)
- [ ] Non-root user for security
- [ ] FFmpeg available for video processing
- [ ] SQLite database persisted via volume
- [ ] Uploads directory persisted via volume
- [ ] Health check endpoint works
- [ ] Container starts and serves requests

---

### CRIT-07: Install and Configure Kamal for Deployment

**Category:** DevOps
**Owner:** DevOps
**Effort:** Medium (4-6 hours)
**Status:** [ ] Not Started
**Dependency:** CRIT-06 (Dockerfile must exist first)

#### Problem
No deployment automation. Kamal chosen but not set up:
- Kamal binary not installed
- No `config/deploy.yml`
- No `.kamal/` secrets directory

#### Solution
Install Kamal and configure for PuppetMaster2 deployment.

#### Implementation

**1. Install Kamal:**
```bash
# Requires Ruby 3.0+
gem install kamal

# Verify installation
kamal version
```

**2. Initialize Kamal:**
```bash
cd /path/to/PuppetMaster2
kamal init
```

**3. Configure `config/deploy.yml`:**

```yaml
# Name of the application
service: puppetmaster2

# Docker image name
image: your-registry/puppetmaster2

# Deploy to these servers
servers:
  web:
    hosts:
      - your-server-ip
    labels:
      traefik.http.routers.puppetmaster2.rule: Host(`yourdomain.com`)
      traefik.http.routers.puppetmaster2.tls: true
      traefik.http.routers.puppetmaster2.tls.certresolver: letsencrypt
    options:
      network: traefik-public

# Container registry credentials
registry:
  server: ghcr.io  # or your registry
  username:
    - KAMAL_REGISTRY_USERNAME
  password:
    - KAMAL_REGISTRY_PASSWORD

# Environment variables (non-secret)
env:
  clear:
    NODE_ENV: production
    HOST: 0.0.0.0
    PORT: 3000
  secret:
    - DATABASE_URL
    - SMTP_HOST
    - SMTP_PORT
    - SMTP_USER
    - SMTP_PASS
    - SMTP_FROM
    - TELEGRAM_BOT_TOKEN
    - TELEGRAM_CHAT_ID

# Persistent storage
volumes:
  - "puppetmaster2_data:/app/data"
  - "puppetmaster2_uploads:/app/public/uploads"

# Traefik for SSL and routing
traefik:
  options:
    publish:
      - "443:443"
    volume:
      - "/letsencrypt:/letsencrypt"
  args:
    entryPoints.web.address: ":80"
    entryPoints.websecure.address: ":443"
    certificatesResolvers.letsencrypt.acme.email: "your-email@example.com"
    certificatesResolvers.letsencrypt.acme.storage: "/letsencrypt/acme.json"
    certificatesResolvers.letsencrypt.acme.httpchallenge: true
    certificatesResolvers.letsencrypt.acme.httpchallenge.entrypoint: "web"

# Health check
healthcheck:
  path: /api/health
  port: 3000
  max_attempts: 10
  interval: 20s

# SSH settings
ssh:
  user: deploy

# Builder settings
builder:
  multiarch: false
  cache:
    type: gha
```

**4. Configure secrets (`.kamal/secrets`):**
```bash
# Create secrets file
kamal secrets init

# Add secrets (will be encrypted)
kamal secrets add DATABASE_URL "/app/data/sqlite.db"
kamal secrets add SMTP_HOST "smtp.example.com"
# ... etc
```

**5. First deployment:**
```bash
# Setup server (install Docker, etc.)
kamal setup

# Deploy
kamal deploy

# Check status
kamal details

# View logs
kamal logs
```

#### Directory Structure After Setup
```
PuppetMaster2/
├── config/
│   └── deploy.yml          # Kamal configuration
├── .kamal/
│   ├── secrets             # Encrypted secrets
│   └── hooks/              # Deployment hooks (optional)
├── Dockerfile              # Container definition
└── .dockerignore           # Docker build exclusions
```

#### Acceptance Criteria
- [ ] Kamal gem installed
- [ ] `config/deploy.yml` configured
- [ ] Secrets encrypted and stored
- [ ] `kamal setup` runs successfully on target server
- [ ] `kamal deploy` deploys application
- [ ] SSL/TLS configured via Traefik
- [ ] Health checks passing
- [ ] Volumes persisting data
- [ ] Rollback works (`kamal rollback`)

---

## High Priority Tasks

### HIGH-01: Add Database Transactions for Multi-Step Operations

**Category:** Backend
**Owner:** Backend
**Effort:** Medium (4-6 hours)
**Status:** [ ] Not Started

#### Problem
Multi-step operations don't use transactions:
- User creation + session creation
- Portfolio item + media processing
- Settings updates across related keys

Risk: Partial commits on failure, data inconsistency.

#### Solution
Use Drizzle transactions for atomic operations.

#### Implementation

**Example for user creation with session:**
```typescript
import { db } from '~/server/database/client'

export async function createUserWithSession(userData: UserInput) {
  return await db.transaction(async (tx) => {
    // Create user
    const user = await tx.insert(schema.users)
      .values({
        email: userData.email,
        passwordHash: await hashPassword(userData.password),
        name: userData.name,
        role: userData.role
      })
      .returning()
      .get()

    // Create session
    const session = await tx.insert(schema.sessions)
      .values({
        id: generateSessionId(),
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION)
      })
      .returning()
      .get()

    return { user, session }
  })
}
```

#### Files to Modify
- `server/api/auth/login.post.ts` - Wrap session creation
- `server/api/admin/users/index.post.ts` - Wrap user creation
- `server/api/portfolio/index.post.ts` - Wrap portfolio + media
- `server/api/admin/settings.put.ts` - Wrap multiple settings updates

#### Acceptance Criteria
- [ ] All multi-step operations wrapped in transactions
- [ ] Rollback on any step failure
- [ ] No partial data on errors
- [ ] Tests verify atomic behavior

---

### HIGH-02: Implement DB-Level Pagination

**Category:** Backend
**Owner:** Backend
**Effort:** Low (2-3 hours)
**Status:** [ ] Not Started

#### Problem
Current pagination loads all records then slices in JS:
```typescript
const allContacts = await db.select().from(schema.contactSubmissions)
const paginated = allContacts.slice(offset, offset + limit)
```

Inefficient at scale, wastes memory and database I/O.

#### Solution
Use SQL LIMIT/OFFSET with Drizzle.

#### Implementation

```typescript
// Before (inefficient)
const allItems = await db.select().from(schema.contactSubmissions).all()
const total = allItems.length
const items = allItems.slice(offset, offset + limit)

// After (efficient)
const [items, countResult] = await Promise.all([
  db.select()
    .from(schema.contactSubmissions)
    .orderBy(desc(schema.contactSubmissions.createdAt))
    .limit(limit)
    .offset(offset)
    .all(),
  db.select({ count: count() })
    .from(schema.contactSubmissions)
    .get()
])

const total = countResult?.count || 0
```

#### Files to Modify
- `server/api/admin/contacts.get.ts`
- `server/api/portfolio/index.get.ts`
- `server/api/admin/users.get.ts`
- `server/api/admin/translations.get.ts`

#### Acceptance Criteria
- [ ] All list endpoints use SQL pagination
- [ ] Total count retrieved efficiently
- [ ] Response includes pagination metadata
- [ ] Performance improved for large datasets

---

### HIGH-03: Add Structured Logging with Pino

**Category:** DevOps
**Owner:** Backend
**Effort:** Medium (4-5 hours)
**Status:** [ ] Not Started

#### Problem
Only `console.log` used:
- No log levels
- No structured format
- No log aggregation support
- No request correlation

#### Solution
Implement Pino logging with request ID correlation.

#### Implementation

**1. Install dependency:**
```bash
npm install pino pino-http
```

**2. Create logger (`server/utils/logger.ts`):**
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  base: {
    service: 'puppetmaster2',
    env: process.env.NODE_ENV
  }
})

export function createRequestLogger(requestId: string) {
  return logger.child({ requestId })
}
```

**3. Add request logging middleware (`server/middleware/request-logging.ts`):**
```typescript
import { randomUUID } from 'crypto'
import { logger, createRequestLogger } from '~/server/utils/logger'

export default defineEventHandler((event) => {
  const requestId = randomUUID()
  const start = Date.now()

  // Attach to event context
  event.context.requestId = requestId
  event.context.log = createRequestLogger(requestId)

  // Set response header
  setHeader(event, 'X-Request-ID', requestId)

  // Log on response
  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    event.context.log.info({
      method: event.method,
      path: event.path,
      status: event.node.res.statusCode,
      duration,
      userAgent: getHeader(event, 'user-agent')
    }, 'request completed')
  })
})
```

**4. Usage in handlers:**
```typescript
export default defineEventHandler(async (event) => {
  const log = event.context.log

  log.info({ email }, 'Login attempt')

  // ... logic ...

  log.warn({ userId, attempts }, 'Failed login attempt')
  log.error({ error: err.message }, 'Database error')
})
```

#### Acceptance Criteria
- [ ] All console.log replaced with logger
- [ ] Request ID in all logs and response headers
- [ ] Log levels used appropriately (info, warn, error)
- [ ] Structured JSON output in production
- [ ] Pretty output in development
- [ ] Logs include timing information

---

### HIGH-04: Implement Audit Logging

**Category:** Security
**Owner:** Backend
**Effort:** Medium (3-4 hours)
**Status:** [ ] Not Started

#### Problem
No audit trail for sensitive operations:
- User creation/deletion
- Role changes
- Login attempts
- Settings modifications

#### Solution
Create audit log table and logging utility.

#### Implementation

**1. Add schema (`server/database/schema.ts`):**
```typescript
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  actorId: integer('actor_id').references(() => users.id),
  actorEmail: text('actor_email'),
  action: text('action').notNull(), // 'user.create', 'user.delete', 'login.success', etc.
  targetType: text('target_type'), // 'user', 'portfolio', 'settings'
  targetId: text('target_id'),
  details: text('details'), // JSON string of additional context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  requestId: text('request_id')
})
```

**2. Create audit utility (`server/utils/audit.ts`):**
```typescript
import type { H3Event } from 'h3'
import { db } from '~/server/database/client'
import * as schema from '~/server/database/schema'

export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.logout'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.role.change'
  | 'settings.update'
  | 'portfolio.create'
  | 'portfolio.update'
  | 'portfolio.delete'

interface AuditEntry {
  action: AuditAction
  targetType?: string
  targetId?: string
  details?: Record<string, any>
}

export async function audit(event: H3Event, entry: AuditEntry): Promise<void> {
  const user = event.context.user
  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getHeader(event, 'x-real-ip')
    || 'unknown'

  await db.insert(schema.auditLogs).values({
    actorId: user?.id || null,
    actorEmail: user?.email || null,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    details: entry.details ? JSON.stringify(entry.details) : null,
    ipAddress: ip,
    userAgent: getHeader(event, 'user-agent') || null,
    requestId: event.context.requestId
  })
}
```

**3. Usage in handlers:**
```typescript
// Login success
await audit(event, {
  action: 'auth.login.success',
  targetType: 'user',
  targetId: String(user.id)
})

// Role change
await audit(event, {
  action: 'user.role.change',
  targetType: 'user',
  targetId: String(userId),
  details: { oldRole, newRole, changedBy: actor.email }
})
```

#### Acceptance Criteria
- [ ] Audit log table created with migration
- [ ] All sensitive operations logged
- [ ] Logs include actor, target, timestamp, IP
- [ ] Audit logs queryable via admin API
- [ ] Logs retained per retention policy

---

### HIGH-05: Add Accessibility Testing

**Category:** Frontend
**Owner:** Frontend
**Effort:** Low (2-3 hours)
**Status:** [ ] Not Started

#### Problem
No automated accessibility testing:
- ARIA labels not verified
- Keyboard navigation not tested
- Screen reader compatibility unknown

#### Solution
Add axe-core for automated a11y testing.

#### Implementation

**1. Install dependencies:**
```bash
npm install -D @axe-core/playwright vitest-axe
```

**2. Create a11y test (`tests/a11y/pages.test.ts`):**
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('Home page should be accessible', async ({ page }) => {
    await page.goto('/')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('Admin login should be accessible', async ({ page }) => {
    await page.goto('/admin/login')

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  // Add tests for other key pages
})
```

**3. Add npm script:**
```json
{
  "scripts": {
    "test:a11y": "playwright test tests/a11y/"
  }
}
```

#### Acceptance Criteria
- [ ] axe-core integrated with test suite
- [ ] Key pages tested for WCAG 2.1 AA
- [ ] No critical/serious violations
- [ ] Tests run in CI pipeline

---

### HIGH-06: Add Loading Skeleton Components

**Category:** Frontend/UX
**Owner:** Frontend
**Effort:** Low (3-4 hours)
**Status:** [ ] Not Started

#### Problem
No loading states visible during async operations:
- Page loads show blank content
- Poor perceived performance
- Users don't know content is loading

#### Solution
Create skeleton loading components.

#### Implementation

**1. Create skeleton component (`app/components/atoms/Skeleton.vue`):**
```vue
<template>
  <div class="skeleton" :class="[variant, { 'skeleton-animated': animated }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'text' | 'circular' | 'rectangular'
  animated?: boolean
}>()
</script>
```

**2. Create CSS (`app/assets/css/ui/skeleton.css`):**
```css
@layer components {
  .skeleton {
    background: var(--l-bg-sunken);
    border-radius: var(--radius-sm);
  }

  .skeleton-animated {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton.text {
    height: 1em;
    width: 100%;
  }

  .skeleton.circular {
    border-radius: 50%;
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
}
```

**3. Create list skeleton (`app/components/molecules/SkeletonList.vue`):**
```vue
<template>
  <div class="skeleton-list">
    <div v-for="i in count" :key="i" class="skeleton-list-item">
      <Skeleton variant="circular" class="skeleton-avatar" animated />
      <div class="skeleton-content">
        <Skeleton variant="text" class="skeleton-title" animated />
        <Skeleton variant="text" class="skeleton-subtitle" animated />
      </div>
    </div>
  </div>
</template>
```

#### Usage
```vue
<template>
  <SkeletonList v-if="pending" :count="5" />
  <ContactList v-else :items="contacts" />
</template>
```

#### Acceptance Criteria
- [ ] Skeleton component created with variants
- [ ] Animation smooth and subtle
- [ ] Used in all async list views
- [ ] Matches layout of actual content
- [ ] CSS in global system (not scoped)

---

### HIGH-07: Design Empty States

**Category:** Frontend/UX
**Owner:** Frontend
**Effort:** Low (2-3 hours)
**Status:** [ ] Not Started

#### Problem
No empty state designs:
- Empty lists show nothing
- Users confused about next steps
- Missing call-to-action

#### Solution
Create empty state component with contextual messaging.

#### Implementation

**Create component (`app/components/molecules/EmptyState.vue`):**
```vue
<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <component :is="icon" v-if="icon" />
    </div>
    <h3 class="empty-state-title">{{ title }}</h3>
    <p class="empty-state-description">{{ description }}</p>
    <div class="empty-state-action" v-if="$slots.action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: Component
  title: string
  description: string
}>()
</script>
```

**Usage:**
```vue
<EmptyState
  v-if="contacts.length === 0"
  :icon="InboxIcon"
  title="No contacts yet"
  description="Contact submissions will appear here when visitors submit the contact form."
/>
```

#### Pages Needing Empty States
- Portfolio list (admin)
- Contact submissions (admin)
- User list (admin)
- Translations (admin)

#### Acceptance Criteria
- [ ] EmptyState component created
- [ ] Each list view has appropriate empty state
- [ ] Includes helpful message and icon
- [ ] Call-to-action where appropriate

---

### HIGH-08: Environment Variable Validation at Startup

**Category:** DevOps
**Owner:** Backend
**Effort:** Low (1-2 hours)
**Status:** [ ] Not Started

#### Problem
Missing environment variables cause runtime errors:
- App starts but fails on first use
- Cryptic error messages
- No clear indication of missing config

#### Solution
Validate required environment variables at startup.

#### Implementation

**Create validation (`server/utils/env.ts`):**
```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().transform(Number).default('3000'),

  // Optional features
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  // External API (if using hybrid mode)
  API_BASE_URL: z.string().url().optional(),
  API_CLIENT_ID: z.string().optional(),
  API_CLIENT_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('Environment validation failed:')
    result.error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`)
    })
    process.exit(1)
  }

  return result.data
}

// Call at startup
export const env = validateEnv()
```

**Use in plugin (`server/plugins/env-validation.ts`):**
```typescript
import { validateEnv } from '~/server/utils/env'

export default defineNitroPlugin(() => {
  validateEnv()
})
```

#### Acceptance Criteria
- [ ] All required env vars validated at startup
- [ ] Clear error messages for missing vars
- [ ] App exits with non-zero code on failure
- [ ] Optional vars have sensible defaults
- [ ] Validation runs before any database access

---

### HIGH-09: Add HTML Sanitization for Portfolio Content

**Category:** Security
**Owner:** Backend
**Effort:** Low (2-3 hours)
**Status:** [ ] Not Started

#### Problem
Portfolio content stored without sanitization:
- Could contain malicious HTML/JS
- XSS risk if rendered with v-html
- No defense-in-depth

#### Solution
Sanitize HTML content on input using DOMPurify.

#### Implementation

**1. Install dependency:**
```bash
npm install isomorphic-dompurify
```

**2. Create sanitization utility (`server/utils/sanitize.ts`):**
```typescript
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class',
  'target', 'rel'
]

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'], // Allow target="_blank"
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
  })
}

export function sanitizeText(dirty: string): string {
  // Strip all HTML, keep only text
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
}
```

**3. Apply in portfolio endpoints:**
```typescript
// In portfolio create/update
const sanitizedContent = sanitizeHtml(body.content)
const sanitizedDescription = sanitizeText(body.description)
```

#### Acceptance Criteria
- [ ] All user HTML input sanitized before storage
- [ ] Script tags and event handlers removed
- [ ] Safe tags preserved (formatting, links, images)
- [ ] Tests verify sanitization behavior
- [ ] Frontend can safely use v-html for content

---

### HIGH-10: Upgrade SameSite Cookie to Strict

**Category:** Security
**Owner:** Backend
**Effort:** Low (30 minutes)
**Status:** [ ] Not Started

#### Problem
Session cookie uses `SameSite: lax`:
- Allows some cross-site cookie sending
- Not maximum protection

#### Solution
Upgrade to `SameSite: strict`.

#### Implementation

**Modify:** `server/api/auth/login.post.ts`

```typescript
// Before
setCookie(event, 'pm-session', sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // <-- Change this
  path: '/',
  expires: expiresAt
})

// After
setCookie(event, 'pm-session', sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // <-- To this
  path: '/',
  expires: expiresAt
})
```

Also update CSRF cookie in CRIT-01 implementation.

#### Considerations
- Test that login still works from external links
- Verify no legitimate cross-site flows broken

#### Acceptance Criteria
- [ ] Session cookie uses SameSite=strict
- [ ] CSRF cookie uses SameSite=strict
- [ ] Login flow works correctly
- [ ] No broken functionality

---

## Medium Priority Tasks

### MED-01: Add Public Health Check Endpoint

**Category:** DevOps
**Owner:** Backend
**Effort:** Low (1 hour)
**Status:** [ ] Not Started

#### Problem
No public health check for:
- Load balancer health checks
- Kubernetes liveness probes
- Monitoring systems

#### Solution
Create `/api/health` endpoint (unauthenticated).

#### Implementation

**Create:** `server/api/health.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {} as Record<string, { status: string; latency?: number }>
  }

  // Database check
  const dbStart = Date.now()
  try {
    await db.select().from(schema.users).limit(1).get()
    checks.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart
    }
  } catch (err) {
    checks.status = 'degraded'
    checks.checks.database = { status: 'error' }
  }

  // Memory check
  const memUsage = process.memoryUsage()
  checks.checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
    latency: Math.round(memUsage.heapUsed / 1024 / 1024)
  }

  setResponseStatus(event, checks.status === 'ok' ? 200 : 503)
  return checks
})
```

#### Acceptance Criteria
- [ ] `/api/health` returns 200 when healthy
- [ ] Returns 503 when degraded
- [ ] Includes database connectivity check
- [ ] Includes memory usage
- [ ] Response time < 100ms

---

### MED-02: Add Scheduled Session Cleanup

**Category:** Backend
**Owner:** Backend
**Effort:** Low (2 hours)
**Status:** [ ] Not Started

#### Problem
Expired sessions remain in database:
- Table grows indefinitely
- No cleanup mechanism
- Potential performance impact

#### Solution
Add scheduled cleanup task for expired sessions.

#### Implementation

**Create:** `server/tasks/cleanup-sessions.ts`

```typescript
import { db } from '~/server/database/client'
import * as schema from '~/server/database/schema'
import { lt } from 'drizzle-orm'
import { logger } from '~/server/utils/logger'

export default defineTask({
  meta: {
    name: 'cleanup:sessions',
    description: 'Remove expired sessions from database'
  },
  async run() {
    const result = await db.delete(schema.sessions)
      .where(lt(schema.sessions.expiresAt, new Date()))
      .returning({ id: schema.sessions.id })

    logger.info({ count: result.length }, 'Cleaned up expired sessions')

    return { result: 'success', cleaned: result.length }
  }
})
```

**Configure in `nuxt.config.ts`:**
```typescript
nitro: {
  scheduledTasks: {
    '0 * * * *': ['cleanup:sessions'] // Every hour
  }
}
```

#### Acceptance Criteria
- [ ] Task runs hourly
- [ ] Expired sessions deleted
- [ ] Cleanup logged with count
- [ ] No impact on active sessions

---

### MED-03: Add Optimistic Locking

**Category:** Backend
**Owner:** Backend
**Effort:** Medium (3-4 hours)
**Status:** [ ] Not Started

#### Problem
Concurrent edits can overwrite each other:
- No conflict detection
- Last write wins
- Data loss possible

#### Solution
Implement optimistic locking using `updatedAt` timestamp.

#### Implementation

**In update handlers:**
```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { expectedVersion } = body // Client sends last known updatedAt

  // Check version
  const current = await db.select()
    .from(schema.portfolioItems)
    .where(eq(schema.portfolioItems.id, id))
    .get()

  if (current.updatedAt.getTime() !== new Date(expectedVersion).getTime()) {
    throw createError({
      statusCode: 409,
      message: 'Resource was modified by another user. Please refresh and try again.',
      data: { currentVersion: current.updatedAt }
    })
  }

  // Proceed with update
  const updated = await db.update(schema.portfolioItems)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.portfolioItems.id, id))
    .returning()
    .get()

  return updated
})
```

#### Acceptance Criteria
- [ ] Concurrent edits detected
- [ ] 409 returned on conflict
- [ ] Client receives current version
- [ ] UI shows conflict resolution option

---

### MED-04: Add Reduced Motion Support

**Category:** Frontend
**Owner:** Frontend
**Effort:** Low (1-2 hours)
**Status:** [ ] Not Started

#### Problem
Animations may cause issues for users with vestibular disorders:
- No `prefers-reduced-motion` support
- Animations cannot be disabled

#### Solution
Add CSS media queries for reduced motion.

#### Implementation

**Add to `app/assets/css/animations/base.css`:**
```css
@layer components {
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Skeleton animation respects preference */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-animated {
      animation: none;
    }
  }
}
```

#### Acceptance Criteria
- [ ] All animations respect reduced-motion preference
- [ ] Transitions shortened, not removed entirely
- [ ] Skeleton pulses stopped
- [ ] Scroll behavior uses auto instead of smooth

---

## Low Priority Tasks

### LOW-01: Add Redis for Distributed Rate Limiting

**Category:** DevOps
**Owner:** Backend
**Effort:** Medium (4-5 hours)
**Status:** [ ] Not Started

#### Problem
In-memory rate limiting:
- Resets on restart
- Not shared across instances
- Not suitable for horizontal scaling

#### Solution
Optional Redis backend for rate limiting.

#### Implementation
Use ioredis with fallback to in-memory for single-instance deployments.

#### Acceptance Criteria
- [ ] Redis rate limiter implemented
- [ ] Falls back to in-memory if Redis unavailable
- [ ] Configuration via environment variable
- [ ] Tested in multi-instance scenario

---

### LOW-02: Add Database Encryption

**Category:** Security
**Owner:** Backend
**Effort:** High (6-8 hours)
**Status:** [ ] Not Started

#### Problem
SQLite database stored unencrypted:
- PII accessible if disk compromised
- Compliance risk (GDPR, HIPAA)

#### Solution
Migrate to SQLCipher for encryption at rest.

#### Considerations
- Requires native module rebuild
- Key management complexity
- Performance impact (~5-15%)

---

### LOW-03: Add APM and Metrics Endpoint

**Category:** DevOps
**Owner:** Backend
**Effort:** Medium (4-5 hours)
**Status:** [ ] Not Started

#### Problem
No application performance monitoring:
- No metrics for Prometheus/Grafana
- No distributed tracing
- Limited observability

#### Solution
Add `/api/metrics` endpoint for Prometheus scraping.

---

### LOW-04: Add Keyboard Shortcuts in Admin

**Category:** UX
**Owner:** Frontend
**Effort:** Medium (4-5 hours)
**Status:** [ ] Not Started

#### Problem
No keyboard shortcuts for power users:
- All actions require mouse
- Slower workflow

#### Solution
Add keyboard shortcuts with discoverable help modal.

---

### LOW-05: Create Onboarding Wizard

**Category:** UX
**Owner:** Frontend
**Effort:** High (8-12 hours)
**Status:** [ ] Not Started

#### Problem
No guided setup for first-time users:
- Must know all settings to configure
- Easy to miss important config

#### Solution
Step-by-step onboarding wizard for initial setup.

---

### LOW-06: Implement GDPR Data Retention

**Category:** Backend
**Owner:** Backend
**Effort:** Medium (4-5 hours)
**Status:** [ ] Not Started

#### Problem
No automatic data deletion:
- Contact submissions stored indefinitely
- No right-to-be-forgotten implementation
- GDPR compliance gap

#### Solution
Scheduled task for data retention with configurable policies.

---

## Post-Implementation: Kamal Deployment

> Complete after all CRITICAL and HIGH tasks are done.

See **CRIT-07** for full Kamal setup instructions.

### Deployment Checklist

1. [ ] All CRITICAL tasks completed
2. [ ] All HIGH tasks completed
3. [ ] Dockerfile tested locally
4. [ ] Kamal installed (`gem install kamal`)
5. [ ] `config/deploy.yml` configured
6. [ ] Secrets encrypted in `.kamal/secrets`
7. [ ] Target server prepared
8. [ ] Domain DNS configured
9. [ ] SSL certificates ready (or Let's Encrypt configured)
10. [ ] First deployment successful
11. [ ] Health checks passing
12. [ ] Monitoring configured
13. [ ] Backup strategy in place
14. [ ] Rollback tested

---

## Acceptance Criteria Checklist

### Security Checklist
- [ ] CSRF protection implemented
- [ ] Security headers present
- [ ] Login rate limited
- [ ] Account lockout working
- [ ] File uploads validated
- [ ] HTML content sanitized
- [ ] SameSite cookies strict
- [ ] Audit logging active

### DevOps Checklist
- [ ] Dockerfile builds and runs
- [ ] Kamal configured
- [ ] Structured logging active
- [ ] Health check endpoint works
- [ ] Environment validated at startup

### Backend Checklist
- [ ] Database transactions used
- [ ] Pagination at DB level
- [ ] Session cleanup scheduled
- [ ] Optimistic locking available

### Frontend Checklist
- [ ] Accessibility tests pass
- [ ] Loading skeletons present
- [ ] Empty states designed
- [ ] Reduced motion supported

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-20 | Team Review | Initial documentation |

---

*This document is the source of truth for production readiness tasks. Update status as tasks are completed.*
