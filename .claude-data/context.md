# Puppet Master Context

## State
Branch: master | Updated: 2025-12-29

## Active Tasks
(none)

## Completed
- ESLint warnings fixed (2025-12-29) - 32 → 1 warning
- Full Codebase Audit (2025-12-28) - Grade: A

## Recent Sessions
- 2025-12-28: Session started
- 2025-12-28: Re-initialized with /init
- 2025-12-27: Project initialized with Claude Code

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
