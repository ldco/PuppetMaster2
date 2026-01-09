# Puppet Master Claude System

This document describes the Claude AI integration for Puppet Master — a config-driven studio toolkit for building client websites.

## Overview

Puppet Master includes a set of Claude commands (`/pm *`) that guide developers through project setup and migration. These commands are NOT automated scripts — Claude itself performs the analysis, asks questions, and creates files by following detailed instructions.

## The Puppet Master Architect Role

When working on PM projects, Claude acts as **Puppet Master Architect** — a specialized AI co-pilot that:

1. **Understands PM deeply** — knows the config system, modules, atomic design, CSS layers
2. **Guides workflows** — Greenfield (new projects) and Brownfield (imports)
3. **Uses expert personas** — via `/as` command (nuxt, vue, node, security, ux, devops)
4. **Executes PM commands** — `/pm init`, `/pm migrate`, `/pm status`, `/pm start`

## Commands

All PM commands are defined in `.claude/commands/` and ship with the framework.

### `/pm init` — Greenfield Setup

**Purpose**: Guided wizard for new Puppet Master projects.

**Steps**:
1. Check current config state
2. Ask: Application mode (app-only, website-app, website-admin, website-only)
3. Ask: Features (multilingual, darkMode, PWA, contact notifications)
4. Ask: Content modules (portfolio, blog, team, pricing, testimonials, FAQ, clients, features)
5. Ask: Languages (if multilingual enabled)
6. Ask: Data source (database, api, hybrid)
7. Update `puppet-master.config.ts`
8. Offer to run `/pm start`

**Flags**:
- `--minimal` — Use smart defaults, skip questions
- `--reset` — Reset config to factory defaults

### `/pm migrate` — Brownfield Import

**Purpose**: Import and migrate existing projects into Puppet Master.

**Prerequisites**: Copy existing project to `./import/` folder.

**Steps**:
1. Verify `./import/` exists and has content
2. Deep analysis — decompose entire project
3. Create mapping tables for all 7 domains
4. Ask strategy questions
5. Generate migration plan (`.claude-data/migration-plan.md`)
6. Update configuration
7. Copy assets
8. Summary and next steps

**Flags**:
- `--analyze` — Analysis + mapping only, no changes
- `--resume` — Continue from saved state

### `/pm status` — Configuration Overview

**Purpose**: Display current Puppet Master configuration state.

**Shows**:
- Mode (app-only, website-app, etc.)
- Data source (database, api, hybrid)
- Dev server status
- Enabled features
- Enabled modules
- Sections (navigation order)
- Database status
- Migration status (if in progress)

**Flags**:
- `--config` — Show raw config values
- `--modules` — Show module details only
- `--db` — Show database details

### `/pm start` — Initialize & Start

**Purpose**: Set up database and start development server.

**Steps**:
1. Check node_modules (install if needed)
2. Check configuration exists
3. Check for running server
4. Run database migrations (`db:push`)
5. Seed data (unless `--no-seed`)
6. Start dev server (background)
7. Verify server is running
8. Display URLs and credentials

**Flags**:
- `--fresh` — Reset database completely, then start
- `--no-seed` — Skip seeding (empty database)
- `--build` — Build for production instead of dev

## Migration System

The `/pm migrate` command implements a comprehensive project decomposition and mapping system.

### Project Decomposition

Every imported project is broken into 7 domains:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT DECOMPOSITION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. FRONTEND      Pages, Components, Layouts, Composables/Hooks             │
│  2. BACKEND       API routes, Server logic, Middleware, Utilities           │
│  3. DATABASE      Schema, Models, Migrations, Seed data                     │
│  4. STYLES        Colors, Typography, Spacing, Component styles             │
│  5. AUTH          Users, Sessions, Roles, Protected routes, Providers       │
│  6. I18N          Locales, Translations, RTL, Date/Number formats           │
│  7. ASSETS        Images, Fonts, Icons, Documents, Other files              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mapping Actions

For EVERY item in each domain, Claude determines an action:

| Action | Meaning |
|--------|---------|
| `PM_EXISTS` | Puppet Master already has this — use PM's version |
| `PM_NATIVE` | Use PM's native/showcase implementation |
| `CREATE` | Build new in PM based on import |
| `REWRITE` | Port logic from import to PM patterns |
| `PROXY` | Keep external, PM proxies to it |
| `KEEP` | Keep original system running alongside |
| `COPY` | Direct copy (assets, static files) |
| `CONVERT` | Transform format (e.g., Tailwind → PM CSS) |
| `MERGE` | Combine with existing PM component |
| `SKIP` | Not needed, PM handles differently |

### Mapping Tables

Claude creates comprehensive mapping tables for:

- **Pages Mapping** — Import route → PM route + action
- **Components Mapping** — Import component → PM equivalent + atomic level + action
- **Composables Mapping** — Import hook → PM equivalent + action
- **API Endpoints Mapping** — Import endpoint → PM endpoint + action
- **Database Schema Mapping** — Import table → PM table + field mapping
- **Color Mapping** — Import color → PM token
- **Typography Mapping** — Import font → PM equivalent
- **Style Class Mapping** — Tailwind/etc. → PM CSS
- **Auth Mapping** — Import auth features → PM equivalent
- **i18n Mapping** — Import locales → PM configuration
- **Assets Mapping** — Import path → PM path + action

### Strategy Questions

After analysis, Claude asks key decisions:

1. **Overall Goal**: Full PM Native / PM Frontend + Keep Backend / Gradual / PM + Extensions
2. **Backend**: Use PM Backend / Keep External / Hybrid / Different Backend
3. **Styles**: Full PM Styles / Keep Original + Add PM / Convert to PM
4. **Data**: Fresh Start / Migrate Data / Keep External Database
5. **PM Mode**: website-admin / website-app / app-only / website-only

### Migration Plan

Output is saved to `.claude-data/migration-plan.md` containing:

- Strategy summary
- Complete mapping tables
- Phase-by-phase migration steps
- Validation checklist
- Reference files list

## Workflows

### Greenfield (New Project)

```bash
# 1. Clone Puppet Master
git clone <puppet-master-repo> my-project
cd my-project

# 2. Start Claude session
claude  # or your Claude interface

# 3. General Claude setup
/init

# 4. PM-specific setup (asks questions)
/pm init

# 5. Initialize and start
/pm start
```

### Brownfield (Import Existing)

```bash
# 1. Clone Puppet Master
git clone <puppet-master-repo> my-project
cd my-project

# 2. Copy existing project to import folder
cp -r ~/existing-project ./import/

# 3. Start Claude session
claude

# 4. General Claude setup
/init

# 5. Analyze and plan migration
/pm migrate

# 6. Initialize and start
/pm start

# 7. Work through migration plan
# Ask Claude: "Help me migrate the Header component"
# Ask Claude: "Set up the API proxy for /api/posts"
```

### Contributing Back to PM

When working on a client project and you fix a bug or add a feature that should be contributed back to the PM framework:

```bash
# In CLIENT PROJECT (after fixing/improving PM base code)

# 1. Export the contribution
/pm contribute

# 2. Answer questions about the fix/feature
#    - Type (bugfix, feature, enhancement)
#    - Priority
#    - Files changed
#    - Testing instructions

# 3. Copy generated file to PM framework
cp .pm-contribution.md ~/puppet-master/

# In PM FRAMEWORK REPO

# 4. Apply the contribution
/pm apply

# 5. Review changes, test, then commit
/commit "feat: description from contribution"
```

### `/pm contribute` — Export Contribution

**Purpose**: Generate a contribution document from client project fixes/features.

**Output**: `.pm-contribution.md` containing:
- Meta (ID, type, priority, date)
- Summary and problem description
- Solution description
- Domains affected
- Files changed (with diffs)
- Dependencies and breaking changes
- Testing instructions

### `/pm apply` — Apply Contribution

**Purpose**: Read contribution document and implement changes in PM framework.

**Steps**:
1. Parse contribution file
2. Display summary for review
3. Check for conflicts
4. Apply file changes (modify, create, delete)
5. Install dependencies if needed
6. Run lint/build verification
7. Display testing instructions
8. Suggest commit command

**Flags**:
- `--review` — Review only, don't apply changes

## Integration with PM Architecture

### Application Modes

PM supports 4 modes (configured via `/pm init` or `/pm migrate`):

| Mode | Website | Login Button | Admin Access |
|------|---------|--------------|--------------|
| `app-only` | No | N/A | / → /login |
| `website-app` | Yes | Visible | /login route |
| `website-admin` | Yes | Hidden | /admin (secret) |
| `website-only` | Yes | None | No admin |

### Content Modules

PM has 9 built-in modules:

1. **Portfolio** — Project showcase, galleries, case studies
2. **Blog** — Posts, categories, tags
3. **Team** — Member profiles
4. **Pricing** — Tiers, comparison table
5. **Testimonials** — Customer reviews
6. **FAQ** — Accordion questions
7. **Clients** — Logo showcase
8. **Features** — Feature cards
9. **Contact** — Forms, notifications

### Component Architecture

PM uses Atomic Design:

```
app/components/
├── atoms/          # Button, Input, Icon, Badge
├── molecules/      # Card, NavItem, FormField
├── organisms/      # Header, Footer, Sidebar
├── sections/       # SectionHero, SectionPricing
└── templates/      # Layouts
```

### CSS System

PM uses Pure CSS with 5-layer cascade:

```css
@layer reset, primitives, semantic, components, utilities
```

- OKLCH color system
- `light-dark()` function for themes
- No Tailwind/frameworks

### Data Sources

PM supports 3 data source modes:

1. **database** — SQLite + Drizzle (default)
2. **api** — External REST API
3. **hybrid** — Per-resource configuration

## Best Practices

### For Claude Sessions

1. **Always read CLAUDE.md first** — Contains critical rules
2. **Check .claude-data/context.md** — Session state and history
3. **Use /pm commands** — Don't manually edit config unless necessary
4. **Follow atomic design** — Place components in correct folders
5. **Use global CSS** — No scoped styles in components

### For Migrations

1. **Never modify ./import/** — Keep as reference
2. **Map everything** — No item should be unmapped
3. **Ask before assuming** — User decides strategy
4. **PM patterns first** — Prefer PM solutions over porting
5. **Phase by phase** — Work through migration plan sequentially

## File Structure

```
.claude/
├── config.json              # Project Claude config
├── settings.local.json      # User settings (gitignored)
├── context.md               # Session context
└── commands/                # PM commands (ship with framework)
    ├── pm-init.md
    ├── pm-migrate.md
    ├── pm-status.md
    └── pm-start.md

.claude-data/
├── context.md               # Persistent context
├── migration-plan.md        # Generated migration plan
└── migration.json           # Migration state (for resume)

import/                      # Brownfield import folder
└── .gitkeep                 # Placeholder (git-tracked)
```

## Troubleshooting

### Commands not recognized

Ensure `.claude/commands/` exists and contains the pm-*.md files.

### Migration stuck

Use `/pm migrate --resume` to continue from saved state.

### Config issues

Use `/pm status` to see current config, or check `puppet-master.config.ts` directly.

### Database issues

Use `/pm start --fresh` to reset database completely.
