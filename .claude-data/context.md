# Puppet Master Context

## State
Branch: master | Updated: 2026-01-04

## Active Tasks
(none)

## Completed
- Full code review + team review (2026-01-02)
- Fixed 2 TypeScript errors (i18n/content.ts, rateLimit.ts)
- Added inline form validation to contact form
- Added autocomplete attributes to contact form
- Installed Playwright for E2E tests
- Committed: feat: Add pricing system, reveal animations, and security enhancements

## Recent Sessions
- 2026-01-02: Code review, fixes, and commit
- 2025-12-29: ESLint warnings fixed
- 2025-12-28: Full Codebase Audit - Grade: A

## Architecture Notes
- **4 Application Modes**: app-only, website-app, website-admin, website-only
- **Dual Data Source**: SQLite OR external REST API (hybrid mode available)
- **RBAC**: Master (developer), Admin (client), Editor (employee)
- **Pure CSS**: 5-layer system with OKLCH colors, light-dark() function
- **i18n**: Database-driven translations with RTL support

## Key Decisions
- Using SQLite with Drizzle ORM for simplicity
- Pure CSS approach (no Tailwind/frameworks)
- Atomic Design for component structure
- Config-driven architecture via puppet-master.config.ts

## Blockers
(none)

## Notes
- Default accounts in dev: master@example.com / master123
- Deployment: Docker + Kamal + Traefik
- Documentation in docs/ folder
- Commit not pushed: git push origin master
