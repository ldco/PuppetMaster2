# PM Setup Workflows

How to configure a Puppet Master project using different methods.

---

## Quick Start (With Claude Code)

**The fastest way to set up a PM project:**

```bash
git clone puppet-master my-project
cd my-project/app
npm install

# In Claude Code terminal:
/pm-init
```

That's it! Claude starts the wizard and guides you through setup.

**What happens:**
1. Claude checks `pmMode` in config
2. If unconfigured → starts dev server + opens wizard
3. If configured → shows status + asks what to do

---

## Overview

PM supports three setup methods, all producing the same result:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   WIZARD    │  │    CLI      │  │  HEADLESS   │         │
│  │  (Browser)  │  │  (Terminal) │  │  (CI/CD)    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│              ┌───────────────────────┐                      │
│              │ puppet-master.config.ts│                      │
│              └───────────────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Method | Best For | Command |
|--------|----------|---------|
| **Browser Wizard** | Visual configuration, first-time users | `/pm-init` (Claude) or `npm run dev` (auto-redirects) |
| **CLI Prompts** | Terminal lovers, SSH sessions | `npm run setup:cli` |
| **Headless** | CI/CD, Docker, automation | `npm run setup:headless --mode=build` |

---

## Method 1: Browser Wizard (Recommended)

### With Claude Code

```bash
git clone puppet-master my-project
cd my-project/app
npm install

# In Claude Code terminal:
/pm-init
```

Claude runs the dev server and opens the wizard at `/setup`.

### Without Claude Code

```bash
git clone puppet-master my-project
cd my-project/app
npm install
npm run dev
# Browser opens → automatically redirected to /setup wizard
```

When `pmMode: 'unconfigured'`, the middleware automatically redirects ALL routes to `/setup`.

### Mode Selection

First, choose your mode:
- **DEVELOP** — One-click to start with all features enabled (no wizard)
- **BUILD** — Opens the configuration wizard

### Wizard Steps (BUILD mode only)

1. **Project Type** — Website or App
2. **Import Detection** — Fresh start or import existing code from `./import/`
3. **Features** — Select modules (blog, portfolio, team, etc.) and languages
4. **Review** — Summary and apply configuration

After completion, the wizard:
- Updates `puppet-master.config.ts`
- Redirects to the configured site

Then run:
```bash
npm run db:push   # Apply database schema
npm run db:seed   # Seed sample data (optional)
```

---

## Method 2: CLI Prompts

For developers who prefer terminal or are working over SSH.

```bash
npm run setup:cli
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    🎭 PUPPET MASTER CLI SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose your mode:
  1. BUILD - Create a client project
  2. DEVELOP - Work on the PM framework
Enter number: 1

What are you building?
  1. Website - Marketing site, landing pages
  2. App - Dashboard, user features
Enter number: 1

Enable admin panel? [Y/n] y

Select modules to enable:
  1. Blog
  2. Portfolio
  3. Team
  ...
Selection: 1,2,9

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        📋 REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Mode:         BUILD
  Type:         Website
  Admin:        Enabled
  Modules:      blog, portfolio, contact
  Languages:    English
  Features:     Dark Mode

Apply this configuration? [Y/n] y

✅ Configuration saved!

Next steps:
  npm run db:push
  npm run db:seed
  npm run dev
```

---

## Method 3: Headless (CI/CD)

For automated deployments, Docker builds, and scripted setups.

### CLI Arguments

```bash
# Basic website
npm run setup:headless -- --mode=build --type=website

# Full featured website
npm run setup:headless -- \
  --mode=build \
  --type=website \
  --modules=blog,portfolio,contact \
  --locales=en,es \
  --dark-mode=true

# App with admin
npm run setup:headless -- --mode=build --type=app --admin=true

# Framework development mode
npm run setup:headless -- --mode=develop
```

### Environment Variables

```bash
PM_MODE=build \
PM_TYPE=website \
PM_ADMIN=true \
PM_MODULES="blog,portfolio,contact" \
PM_LOCALES="en,ru" \
PM_DEFAULT_LOCALE="en" \
npm run setup:headless
```

### Full Options

```
Options:
  --mode=<build|develop>     Required. Project mode
  --type=<website|app>       Project type (build mode only, default: website)
  --admin=<true|false>       Enable admin panel (default: true)
  --modules=<list>           Comma-separated modules (default: contact)
                             Options: blog,portfolio,team,testimonials,faq,
                                      pricing,clients,features,contact
                             Use "all" for all modules
  --locales=<list>           Comma-separated locale codes (default: en)
                             Options: en,ru,he,es,fr,de,zh,ja
  --default-locale=<code>    Default locale (default: first in list)
  --dark-mode=<true|false>   Enable dark mode toggle (default: true)
  --onepager=<true|false>    One-page layout (default: false)
  --pwa=<true|false>         Progressive Web App (default: false)
```

### CI/CD Example (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Configure PM
        run: npm run setup:headless -- --mode=build --type=website --modules=blog,contact

      - name: Setup database
        run: |
          npm run db:push
          npm run db:seed

      - name: Build
        run: npm run build

      - name: Deploy
        run: kamal deploy
```

### Docker Example

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run setup:headless -- --mode=build --type=website
RUN npm run db:push
RUN npm run db:seed
RUN npm run build

CMD ["node", ".output/server/index.mjs"]
```

---

## Command Reference

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (redirects to /setup if unconfigured) |
| `npm run setup:cli` | Interactive CLI prompts in terminal |
| `npm run setup:headless` | Non-interactive, config-based setup |
| `npm run db:push` | Apply database schema |
| `npm run db:seed` | Seed initial data |

### Claude Commands (Primary Workflow)

| Command | Description |
|---------|-------------|
| `/pm-init` | Main entry point — starts wizard if unconfigured, shows options if configured |
| `/pm-dev` | Start/restart dev server (kills existing first) |
| `/pm-status` | Show current configuration state |

**Claude-First Workflow:**

```
/pm-init                    # First time → wizard
                           # Already configured → asks what to do

/pm-dev                    # Just run dev server
/pm-dev --fresh            # Reset database + start

/pm-status                 # Check configuration
/pm-init --reset           # Reset to unconfigured
```

---

## Configuration Output

All methods produce the same output in `puppet-master.config.ts`:

```typescript
const config = {
  // Mode: 'unconfigured' | 'build' | 'develop'
  pmMode: 'build',

  // Entity type
  entities: {
    website: true,   // or false for App
    app: false,      // or true for App
  },

  // Admin panel
  admin: {
    enabled: true,
    // ...
  },

  // Features
  features: {
    multiLangs: true,
    doubleTheme: true,
    onepager: false,
    pwa: false,
  },

  // Modules
  modules: {
    blog: { enabled: true, config: { ... } },
    portfolio: { enabled: true, config: { ... } },
    contact: { enabled: true, config: { ... } },
    // ...
  },

  // Localization
  locales: [
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'es', iso: 'es-ES', name: 'Spanish' },
  ],
  defaultLocale: 'en',

  // ... rest of config
}
```

---

## Reconfiguration

To change settings after initial setup:

### Browser Wizard
Navigate to `/setup` directly in your browser.

### CLI
```bash
npm run setup:cli
```

### Headless
Re-run with new options:
```bash
npm run setup:headless -- --mode=build --type=app --modules=all
```

### With Claude
```bash
/pm-init
# Select "Reconfigure" option
```

---

## Files Reference

```
scripts/
  setup-cli.ts        # Interactive CLI prompts
  setup-headless.ts   # Non-interactive setup
  lib/
    config-writer.ts  # Writes puppet-master.config.ts
    config-reader.ts  # Reads current config
    index.ts          # Library exports

app/pages/
  setup.vue           # Browser wizard page

app/middleware/
  00.setup.global.ts  # Redirects unconfigured to /setup

server/api/setup/
  config.get.ts       # GET current config
  config.post.ts      # POST save config
```
