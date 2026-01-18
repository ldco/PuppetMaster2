# Puppet Master Claude System

This document describes the Claude AI integration for Puppet Master — a config-driven studio toolkit for building client websites.

## Overview

Puppet Master includes a set of Claude commands (`/pm-*`) that guide developers through project setup. These commands work with a browser-based wizard to configure projects.

## The Puppet Master Architect Role

When working on PM projects, Claude acts as **Puppet Master Architect** — a specialized AI co-pilot that:

1. **Understands PM deeply** — knows the config system, modules, atomic design, CSS layers
2. **Guides workflows** — Greenfield (new projects) and Brownfield (imports)
3. **Uses expert personas** — via `/as` command (nuxt, vue, node, security, ux, devops)
4. **Executes PM commands** — `/pm-init`, `/pm-dev`, `/pm-status`

## Commands

All PM commands are defined in `.claude/commands/` and ship with the framework.

### Active Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/pm-init` | Main entry point | First-time setup, reconfiguration |
| `/pm-dev` | Run dev server | Starting/restarting development |
| `/pm-status` | Show configuration | Check current state |
| `/pm-migrate` | Brownfield migration | After importing code via wizard (analyze and create migration plan) |
| `/pm-contribute` | Export contribution | After fixing/adding PM feature in client project |
| `/pm-apply` | Apply contribution | In PM repo, to apply contributed fix/feature |

### Deprecated Commands

| Command | Replacement | Notes |
|---------|-------------|-------|
| `/pm-start` | `/pm-dev` | Simplified to just run dev server |

### Command Workflow: Greenfield vs Brownfield

**Greenfield (new project):**
1. Run `/pm-init` → wizard opens
2. Configure project in browser
3. Start building

**Brownfield (importing existing code):**
1. Run `/pm-init` → wizard opens
2. Upload ZIP with existing code in wizard
3. Configure project in browser
4. Run `/pm-migrate` → analyzes imported code and creates migration plan
5. Follow the plan to migrate components

---

## `/pm-init` — Main Entry Point

**Purpose**: Smart entry point that routes based on current project state.

**Behavior based on `pmMode` config value:**

| pmMode | Action |
|--------|--------|
| `'unconfigured'` | Start dev server, open wizard at `/init` |
| `'build'` | Show status, ask what user wants to do |
| `'develop'` | Show status, ask what user wants to do |

**Flags:**
- `--reset` — Reset config to unconfigured state

---

## `/pm-dev` — Run Development Server

**Purpose**: Simple command to start the dev server. Kills any existing server first.

**Steps:**
1. Kill existing server on :3000
2. Install dependencies if needed
3. Start `npm run dev`
4. Display URLs

**Flags:**
- `--fresh` — Reset database, seed, then start
- `--setup` — Start and indicate to open `/init`

---

## `/pm-status` — Configuration Overview

**Purpose**: Display current Puppet Master configuration state.

**Shows:**
- Mode (unconfigured, build, develop)
- Project type (website, app)
- Admin enabled/disabled
- Features and modules
- Database status
- Dev server status

**Flags:**
- `--config` — Show raw config values
- `--modules` — Show module details only
- `--db` — Show database details

---

## The Two-Mode System

PM uses a `pmMode` configuration value to determine behavior:

### `pmMode: 'unconfigured'`

Fresh clone state. Running `/pm-init` starts the wizard.

### `pmMode: 'build'`

Client project mode. The wizard configured this as a client project (website or app).

### `pmMode: 'develop'`

Framework development mode. The wizard configured this to show the PM showcase.

---

## The Setup Wizard

The browser wizard at `/init` is the PRIMARY setup method. It handles:

### Step 1: Mode Selection
- **BUILD** — Creating a client project
- **DEVELOP** — Working on the PM framework

### Step 2: Project Type (BUILD only)
- **Website** — Marketing site, landing pages
- **App** — Dashboard, user features

### Step 3: Import Check (Brownfield Detection)
- **Fresh start** — No existing code
- **Import existing** — Analyze `./import/` folder

### Step 4: Feature Selection
- Modules: Blog, Portfolio, Team, etc.
- Features: Multilingual, Dark Mode, PWA

### Step 5: Design
- Colors, fonts, icon library

### Step 6: Review & Generate
- Summary and generate config

---

## Workflows

### Greenfield (New Project)

```bash
git clone puppet-master my-project
cd my-project/app
npm install

# Claude takes over
/pm-init                   # Starts wizard
# Complete wizard in browser
# Project is configured
```

### Brownfield (Import Existing)

```bash
git clone puppet-master my-project
cd my-project/app
cp -r ~/old-project/* ./import/
npm install

# Claude takes over
/pm-init                   # Starts wizard
# In wizard, select "Yes" for existing code
# Wizard analyzes import folder
# Complete wizard in browser
```

### Quick Start (defaults)

```bash
/pm-init                   # Start wizard
# Select BUILD → Website → defaults
# Done in 1 minute
```

---

## Contributing Back to PM

When working on a client project and you fix a bug or add a feature:

```bash
# In CLIENT PROJECT

# 1. Export the contribution
/pm-contribute

# 2. Copy to PM framework
cp .pm-contribution.md ~/puppet-master/

# In PM FRAMEWORK REPO

# 3. Apply the contribution
/pm-apply

# 4. Review, test, commit
```

---

## Configuration System

### pmMode Values

| Value | Description |
|-------|-------------|
| `'unconfigured'` | Fresh clone, needs setup |
| `'build'` | Client project (website or app) |
| `'develop'` | Framework development |

### Config File

Located at `app/puppet-master.config.ts`. Key fields:

```typescript
export default {
  // Core mode (set by wizard)
  pmMode: 'unconfigured' | 'build' | 'develop',

  // Entity type (what you're building)
  entities: {
    website: true,   // Marketing site with public pages
    app: false,      // Login-required app (/ → /login)
  },

  // Admin panel
  admin: {
    enabled: true,
    system: { users: { enabled: true, roles: ['master', 'admin'] }, ... },
    websiteModules: { blog: { enabled: true, roles: [...] }, ... },
  },

  // Content modules (each has enabled + config)
  modules: {
    blog: { enabled: true, config: { postsPerPage: 10, ... } },
    portfolio: { enabled: true, config: { layout: 'grid', ... } },
    team: { enabled: true, config: { showSocial: true, ... } },
    // ... testimonials, faq, pricing, clients, features, contact
  },

  // Feature toggles
  features: {
    multiLangs: true,      // Multiple languages
    doubleTheme: true,     // Light/dark mode
    onepager: false,       // Scroll-based vs route-based nav
    pwa: false,            // Progressive Web App
    verticalNav: false,    // Sidebar vs horizontal nav
  },

  // Brand colors (4 primitives, rest auto-calculated)
  colors: {
    black: '#2f2f2f',
    white: '#f0f0f0',
    brand: '#aa0000',
    accent: '#0f172a',
  },

  // Supported locales
  locales: [
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'ru', iso: 'ru-RU', name: 'Русский' },
  ],
  defaultLocale: 'en',
}
```

See [Configuration Reference](../reference/configuration.md) for complete reference.

---

## File Structure

```
.claude/
├── config.json              # Project Claude config
├── settings.local.json      # User settings (gitignored)
└── commands/                # PM commands (ship with framework)
    ├── pm-init.md           # Main entry point
    ├── pm-dev.md            # Run dev server
    ├── pm-status.md         # Show configuration
    ├── pm-contribute.md     # Export contribution
    ├── pm-apply.md          # Apply contribution
    ├── pm-migrate.md        # DEPRECATED
    └── pm-start.md          # DEPRECATED

.claude-data/
├── context.md               # Session context
└── migration-plan.md        # Generated during brownfield import

import/                      # Brownfield import folder
├── .gitkeep
└── PROJECT.md               # Optional project spec template
```

---

## Best Practices

### For Claude Sessions

1. **Use /pm-init first** — It routes to the right action
2. **Let the wizard handle setup** — Don't manually edit config
3. **Follow atomic design** — Place components in correct folders
4. **Use global CSS** — No scoped styles in components

### For Development

1. **Use /pm-dev** — Simple server start
2. **Use /pm-status** — Check current state
3. **Use /pm-init --reset** — When you need to reconfigure

---

## Troubleshooting

### Commands not recognized

Ensure `.claude/commands/` exists and contains the pm-*.md files.

### Config issues

Use `/pm-status` to see current config, or check `puppet-master.config.ts` directly.

### Database issues

Use `/pm-dev --fresh` to reset database completely.

### Wizard not loading

1. Check that pmMode is 'unconfigured' in config
2. Ensure dev server is running
3. Navigate to http://localhost:3000/init
