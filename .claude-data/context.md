# Puppet Master Context

## State
Branch: master | Updated: 2026-01-09

## Active Tasks
- PM Claude System implementation complete
- Modular entity architecture IMPLEMENTED (entities + admin modules with per-model RBAC)
- Ready for testing from fresh git clone

## Completed (This Session)
- Implemented modular entity configuration (replaces fixed modes)
- Created config.ts types with EntitiesConfig, AdminConfig, RBAC helpers
- Updated puppet-master.config.ts with entities + admin structure
- Updated useConfig composable with new entity-based helpers
- Updated admin layout and bottom nav to use getAdminSectionsForRole()
- Updated app-mode middleware for entity-based routing
- Added 'user' role to UserRole type for app users
- Architecture redesign: modular entities + flexible RBAC (docs/PM-ARCHITECTURE.md)
- Documented three-category admin module system (System, Website Content, App Data)
- Documented per-model role configuration with master-only role assignment
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

See `docs/PM-ARCHITECTURE.md` for full details.

### Two-Level Architecture
- **Level 1: System Entities** — Website, App (what exists) + Admin (management layer)
- **Level 2: UX Paradigms** — Website UX, App UX (how things look)

### Key Insight
Admin panel is NOT a third UX paradigm — it's App UX with admin sections visible!

| Concept | Definition |
|---------|------------|
| **Website UX** | Horizontal header, page-based (for visitors) |
| **App UX** | Sidebar/bottom nav, feature-based (for ALL logged-in users) |
| **Layout** | Visual style within a UX paradigm |
| **Role** | What navigation sections user sees |

### Modular Entity Configuration (replaces fixed modes)
```typescript
entities: { website: boolean, app: boolean }
admin: { enabled: boolean, system: {...}, websiteModules: {...}, appModules: {...} }
```

### Admin Module Categories
1. **System** (PM provides, universal): users, roles, translations, settings, health, logs
2. **Website Content** (PM provides): sections, blog, portfolio, team, testimonials, faq, clients, pricing
3. **App Data** (custom per project): developer builds

### RBAC
- Role hierarchy: master → admin → editor → user
- Role assignment is ALWAYS master-only (hardcoded)
- Each module has configurable roles array
- Master configures per-model role access

### Other Architecture
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
- **Greenfield (with spec)**: `/init` → fill `./import/PROJECT.md` → `/pm-init` → `/pm-start`
- **Greenfield (quick)**: `/init` → `/pm-init` (wizard) → `/pm-start`
- **Brownfield**: `/init` → copy code to `./import/` → `/pm-migrate` → `/pm-start`
- **Contributing**: (client) `/pm-contribute` → copy `.pm-contribution.md` to PM → (PM) `/pm-apply`

### Command Routing
- `/pm-init` — Smart entry for NEW projects (checks import folder):
  - Code found → redirects to `/pm-migrate`
  - PROJECT.md filled → analyzes and creates plan
  - Nothing/empty → runs wizard
  - Both code + PROJECT.md → shows conflict error
- `/pm-migrate` — ONLY for Brownfield (code imports)

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
