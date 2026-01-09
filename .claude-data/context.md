# Puppet Master Context

## State
Branch: master | Updated: 2026-01-09

## Active Tasks
- PM Claude System implementation complete
- Ready for testing from fresh git clone

## Completed (This Session)
- Created PM Claude command system (`.claude/commands/pm-*.md`)
- Implemented `/pm-init` — Greenfield setup wizard
- Implemented `/pm-migrate` — Brownfield import with full project decomposition
- Implemented `/pm-status` — Configuration overview
- Implemented `/pm-start` — Database + dev server
- Created `./import/` folder for Brownfield imports
- Updated CLAUDE.md with PM commands documentation
- Created comprehensive mapping system for migrations

## Recent Sessions
- 2026-01-09: PM Claude System implementation
- 2026-01-02: Code review, fixes, and commit
- 2025-12-29: ESLint warnings fixed
- 2025-12-28: Full Codebase Audit - Grade: A

## Architecture Notes
- **4 Application Modes**: app-only, website-app, website-admin, website-only
- **Dual Data Source**: SQLite OR external REST API (hybrid mode available)
- **RBAC**: Master (developer), Admin (client), Editor (employee)
- **Pure CSS**: 5-layer system with OKLCH colors, light-dark() function
- **i18n**: Database-driven translations with RTL support

## PM Claude System

### Commands (in `.claude/commands/`)
| File | Command | Purpose |
|------|---------|---------|
| pm-init.md | `/pm-init` | Greenfield wizard — mode, features, modules |
| pm-migrate.md | `/pm-migrate` | Brownfield — decompose, map, plan |
| pm-status.md | `/pm-status` | Show current config state |
| pm-start.md | `/pm-start` | db:push + db:seed + rundev |
| pm-contribute.md | `/pm-contribute` | Export fix/feature as contribution doc |
| pm-apply.md | `/pm-apply` | Apply contribution doc to PM framework |

### Migration System
`/pm-migrate` decomposes imported projects into 7 domains:
1. FRONTEND (Pages, Components, Layouts, Composables)
2. BACKEND (API routes, Middleware, Utilities)
3. DATABASE (Schema, Migrations, Seeds)
4. STYLES (Colors, Typography, Spacing)
5. AUTH (Users, Sessions, Roles)
6. I18N (Locales, Translations, RTL)
7. ASSETS (Images, Fonts, Icons)

Each item gets an action: PM_EXISTS, PM_NATIVE, CREATE, REWRITE, PROXY, KEEP, COPY, CONVERT, MERGE, SKIP

### Workflows
- **Greenfield**: `/init` → edit `./import/PROJECT.md` → `/pm-migrate` → `/pm-start` (offered automatically)
- **Brownfield**: `/init` → copy code to `./import/` → `/pm-migrate` → `/pm-start` (offered automatically)
- **Quick Start**: `/init` → `/pm-init` → `/pm-start`
- **Contributing**: (client) `/pm-contribute` → copy `.pm-contribution.md` to PM → (PM) `/pm-apply`

## Key Decisions
- Using SQLite with Drizzle ORM for simplicity
- Pure CSS approach (no Tailwind/frameworks)
- Atomic Design for component structure
- Config-driven architecture via puppet-master.config.ts
- Claude commands are project-specific (ship with framework)

## Blockers
(none)

## Notes
- Default accounts in dev: master@example.com / master123
- Deployment: Docker + Kamal + Traefik
- Documentation in docs/ folder
- PM Claude docs in docs/PM-CLAUDE-SYSTEM.md
