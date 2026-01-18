# Changelog

All notable changes to Puppet Master will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Two-Factor Authentication (2FA)
- TOTP-based 2FA with QR code setup via `/api/user/2fa/setup`
- Backup codes for account recovery (10 codes per user)
- Rate limiting on all 2FA endpoints:
  - Setup: 10 attempts/hour per user
  - Enable: 5 attempts/15min per user
  - Verify: 5 attempts/15min per IP
  - Disable: 3 attempts/15min per user
- Database migration for 2FA schema (`user_2fa` table, `two_factor_enabled` column)
- Encrypted TOTP secret storage with AES-256

#### API Versioning
- URL path versioning support (`/api/v1/*` routes)
- Accept header versioning (`application/vnd.pm.v1+json`)
- Deprecation headers for sunset versions (`X-API-Deprecated`, `Sunset`)
- Middleware-based URL rewriting to existing handlers
- Version info exported for use in handlers

#### Backup & Recovery
- AES-256-CBC encryption for database backups
- PBKDF2 key derivation (100,000 iterations)
- `--encrypt` flag for manual encryption in backup script
- Auto-encryption when uploading to S3 with `BACKUP_ENCRYPTION_KEY`
- Decryption support in restore script for `.gz.enc` files
- Verification of encrypted backups before restore

#### CI/CD Pipeline
- GitHub Actions workflow (`.github/workflows/ci.yml`) with:
  - Lint & Type Check (ESLint + Nuxi typecheck)
  - Test with Coverage (Codecov/Coveralls integration)
  - Security Scan (npm audit)
  - Build validation with artifact upload
  - Docker image build and caching
  - Visual Regression Tests (Playwright on PRs)
  - Lighthouse CI for performance auditing
  - Production deployment via Kamal (on master push)

#### Error Tracking
- Sentry server plugin (`server/plugins/sentry.ts`):
  - Automatic request context
  - User context from session
  - Sensitive data filtering (passwords, tokens, cookies)
  - 4xx error filtering
  - HTTP, console, and rejection integrations
- Sentry client plugin (`app/plugins/sentry.client.ts`):
  - Vue-specific integrations
  - Browser tracing with Vue Router
  - Component lifecycle tracking
  - Extension URL denial
  - Error filtering (ResizeObserver, network issues)

#### Testing Infrastructure
- Visual regression tests with Playwright (`e2e-playwright/`)
- Accessibility tests with axe-core (WCAG 2.1 AA compliance)
- Responsive design tests across 6 viewports
- Component hover/focus state testing
- 404 page testing

#### Documentation
- Comprehensive CONTRIBUTING.md with:
  - Code of Conduct
  - Development workflow
  - Coding standards (TypeScript, Vue, API, CSS)
  - Commit guidelines (Conventional Commits)
  - Testing guidelines
- Architecture analysis document
- CSS Component Map

### Changed
- Enhanced password validation with strength scoring
- Database backup scripts now support both encrypted and unencrypted formats
- API version middleware now rewrites URLs for transparent versioning
- Improved rate limiter with client IP extraction for proxied environments

### Security
- Password policy enforcement on admin user update flows
- Rate limiting prevents TOTP brute-force attacks (1M combinations)
- Encrypted backups at rest for S3 storage
- CSRF protection on all mutation endpoints
- Sensitive data redaction in Sentry events

---

## [1.0.0] - 2025-01-15

### Added

#### Core Framework
- Nuxt 3 with Vue 3.5 and TypeScript
- Nitro server engine with API routes
- SQLite database with Drizzle ORM
- Config-driven architecture (`puppet-master.config.ts`)

#### Authentication & Authorization
- Session-based authentication with HTTP-only cookies
- Role-based access control (RBAC): user, editor, admin, master
- Account lockout after 5 failed attempts (30min lock)
- Password hashing with scrypt (Node.js native crypto)
- CSRF protection (double-submit cookie pattern)

#### Admin Panel
- Material Design 3 inspired UI
- Responsive navigation:
  - Desktop: Full sidebar
  - Tablet: Navigation rail
  - Mobile: Bottom navigation
- Config-driven module system
- User management with role assignment
- Translation management with cache invalidation
- Settings management
- Health monitoring dashboard

#### Content Modules
- Blog with categories and tags
- Portfolio with media items (images, videos)
- Team members with translations
- Testimonials
- FAQ sections
- Pricing tiers
- Features showcase

#### Internationalization
- Database-driven translations
- Multi-language support (en, ru, he)
- RTL support for Hebrew/Arabic
- Translation caching (5-minute TTL)
- Admin-editable translations

#### CSS Architecture
- 5-layer CSS system:
  1. reset - CSS normalization
  2. primitives - Raw values (colors, fonts)
  3. semantic - Calculated values
  4. components - UI styling
  5. utilities - Override helpers
- OKLCH color space with auto-calculated variations
- Light/dark mode with `light-dark()` function
- No framework dependencies (pure CSS)

#### DevOps
- Docker multi-stage Alpine build (~200MB image)
- Kamal deployment with zero-downtime
- Ansible server provisioning
- Traefik reverse proxy with auto SSL
- Health check endpoint for monitoring

#### Security
- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on login and contact forms
- Input validation with Zod schemas
- Audit logging for security events
- Timing-safe password comparison

### Infrastructure
- SQLite with WAL mode for concurrency
- In-memory and Redis-backed rate limiting
- Translation caching with invalidation
- Optimistic locking for concurrent edits

---

## Version History

| Version | Date       | Description                                |
|---------|------------|--------------------------------------------|
| 1.0.0   | 2025-01-15 | Initial production release                 |

---

## Migration Notes

### Upgrading to Latest

1. **Database migrations**:
   ```bash
   npm run db:migrate
   ```

2. **2FA Configuration** (if using):
   ```env
   TOTP_ENCRYPTION_KEY=your-32-byte-key
   ```

3. **Backup Encryption** (optional but recommended for S3):
   ```env
   BACKUP_ENCRYPTION_KEY=your-strong-passphrase
   ```

4. **Sentry Configuration** (optional):
   ```env
   # Server-side
   SENTRY_DSN=https://xxx@sentry.io/xxx
   SENTRY_ENVIRONMENT=production

   # Client-side
   NUXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
   NUXT_PUBLIC_SENTRY_ENVIRONMENT=production
   ```

---

## Release Notes Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Features removed in this release

### Fixed
- Bug fixes

### Security
- Security improvements
```

## Versioning Guidelines

- **Major (X)**: Breaking changes to API or configuration
- **Minor (Y)**: New features, backwards compatible
- **Patch (Z)**: Bug fixes and minor improvements

## Links

[Unreleased]: https://github.com/your-org/puppetmaster2/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/puppetmaster2/releases/tag/v1.0.0

---

*For detailed documentation, see the [docs/](./docs/) directory.*
