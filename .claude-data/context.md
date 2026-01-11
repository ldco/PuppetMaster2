# Puppet Master Context

## State
Branch: master | Updated: 2026-01-11

## Active Tasks
- Setup wizard converted to single-page form - READY FOR TESTING
- Two-mode system (BUILD vs DEVELOP) implemented

## Completed (This Session)
- Converted 4-step wizard to single-page form (`app/pages/setup.vue`)
- Setup page flow:
  1. Mode Selection: BUILD (configure) vs DEVELOP (one-click)
  2. BUILD shows single-page form with all options visible
  3. DEVELOP applies all features immediately, redirects to homepage
- Form sections (all on one page):
  - Project Type (Website/App) + Admin toggle
  - Setup Source (Fresh/Import with brownfield detection)
  - Modules grid (9 modules)
  - Languages selection (8 locales)
  - Features checkboxes (theme, one-pager, PWA)
- API: `/api/setup/config` (GET) returns current config + brownfield detection
- API: `/api/setup/config` (POST) saves configuration
- Middleware: `00.setup.global.ts` redirects unconfigured projects to `/setup`
- Brownfield detection scans `./import/` folder for existing code

## Previous Session Work
- Implemented two-mode system (BUILD vs DEVELOP)
- Added pmMode to config: 'unconfigured' | 'build' | 'develop'
- Created setup wizard page with mode selection
- Added brownfield/greenfield detection step
- Created SETUP-WORKFLOWS.md documentation
- Updated README with new Quick Start workflow

## Key Files Modified
- `app/pages/setup.vue` - Single-page setup form
- `app/middleware/00.setup.global.ts` - Redirect to /setup when unconfigured
- `server/api/setup/config.get.ts` - Get config + brownfield detection
- `server/api/setup/config.post.ts` - Save configuration
- `app/puppet-master.config.ts` - Added pmMode field
- `docs/SETUP-WORKFLOWS.md` - Workflow documentation

## Setup Flow Summary

### Workflow
```
npm install → npm run dev → /setup opens
   ├─ BUILD → Single-page form → Apply → /admin
   └─ DEVELOP → One-click → Homepage
```

### Claude Workflow
```
/pm-init → Checks pmMode
   ├─ unconfigured → npm install + npm run dev + opens /setup
   └─ configured → Shows current status
```

## Architecture Notes

### pmMode Values
| Value | Description |
|-------|-------------|
| `'unconfigured'` | Fresh clone, needs setup → wizard shown |
| `'build'` | Client project (website or app) |
| `'develop'` | Framework development (showcase) |

### Brownfield Detection
- Scans `./import/` folder for files
- Checks PROJECT.md for filled content (not template)
- If content found, enables "Import Existing" option
- After setup, user runs `/pm-migrate` to process imported code

## Recent Sessions
- 2026-01-11: Setup wizard → single-page form conversion
- 2026-01-10: Two-mode system (BUILD/DEVELOP) implementation
- 2026-01-09: PM Claude System implementation
- 2026-01-02: Code review, fixes, and commit

## PM Claude System

### Commands (in `.claude/commands/`)
| Command | Purpose |
|---------|---------|
| `/pm-init` | Main entry — starts wizard if unconfigured |
| `/pm-dev` | Start dev server (kills existing first) |
| `/pm-status` | Show current config state |
| `/pm-migrate` | Brownfield — decompose, map, plan |
| `/pm-contribute` | Export fix/feature as contribution doc |
| `/pm-apply` | Apply contribution doc to PM framework |

### Deprecated
- `/pm-start` → replaced by `/pm-dev`

## Key Decisions
- Single-page form instead of multi-step wizard (user preference)
- Mode selection (BUILD/DEVELOP) comes before config form
- DEVELOP mode = one-click apply with all features enabled
- BUILD mode = customize via form
- Brownfield detection automatic via ./import/ folder scan

## Blockers
(none)

## Notes
- Default accounts in dev: master@example.com / master123
- Test the setup flow: delete data/sqlite.db, set pmMode to 'unconfigured'
