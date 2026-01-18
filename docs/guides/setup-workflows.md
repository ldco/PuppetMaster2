# PM Setup Workflows

How to configure a Puppet Master project.

---

## Quick Start (With Claude Code)

**Puppet Master is designed to work with Claude Code.** Claude acts as your AI co-pilot, understanding the entire PM framework.

```bash
# 1. Clone the repo
git clone puppet-master my-project
cd my-project/app

# 2. Open in VS Code with Claude Code (or Claude CLI)
code .

# 3. In Claude Code:
/pm-init
```

That's it! `/pm-init` handles everything — dependencies, database, dev server, and wizard.

### PM Claude Commands

| Command | Purpose |
|---------|---------|
| `/pm-help` | **List all commands** — Shows command reference |
| `/pm-init` | **Start here** — Initialize or reconfigure project |
| `/pm-dev` | Start/restart development server |
| `/pm-status` | Show current configuration state |
| `/pm-migrate` | AI-powered migration for brownfield projects |
| `/pm-team` | Multi-expert code review (7 specialists) |
| `/pm-team-all` | Complete team review (42 experts) |
| `/pm-contribute` | Export fix/feature as contribution doc |
| `/pm-apply` | Apply contribution doc to PM framework |

#### Team Review Commands

**By Country** (7 specialists per country):
`/pm-il` • `/pm-ru` • `/pm-us` • `/pm-fr` • `/pm-jp` • `/pm-ch`

**By Specialty** (6 country experts per specialty):
| Command | Focus |
|---------|-------|
| `/pm-ux` | UX/UI design, accessibility |
| `/pm-frontend` | Vue/Nuxt, CSS, performance |
| `/pm-backend` | API, database, security |
| `/pm-security` | OWASP, compliance, pentest |
| `/pm-devops` | Docker, CI/CD, cloud |
| `/pm-fullstack` | Architecture, integration |
| `/pm-fastapi` | External APIs, webhooks |

---

## Quick Start (Without Claude Code)

If you don't have Claude Code:

```bash
git clone puppet-master my-project
cd my-project/app
npm run init
```

This works, but you won't have AI assistance for migration or development.

---

## The Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  /pm-init (or npm run init)                                                 │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────────────┐                                                       │
│  │  npm install     │  (if node_modules missing)                            │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │  Terminal Prompt │  "BUILD or DEVELOP?"                                  │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│     ┌─────┴─────┐                                                           │
│     │           │                                                           │
│     ▼           ▼                                                           │
│  BUILD       DEVELOP                                                        │
│     │           │                                                           │
│     │           ├──→ Set config (all features)                              │
│     │           ├──→ db:push                                                │
│     │           ├──→ db:seed                                                │
│     │           └──→ Start dev server → Ready!                              │
│     │                                                                       │
│     ├──→ Set config (build mode)                                            │
│     ├──→ db:push                                                            │
│     ├──→ Start dev server                                                   │
│     └──→ Open browser → /init wizard                                        │
│                │                                                            │
│                ▼                                                            │
│     ┌─────────────────────────────────────┐                                 │
│     │        Browser Wizard               │                                 │
│     │  ─────────────────────────────────  │                                 │
│     │  • Project Type (Website/App)       │                                 │
│     │  • Admin Panel (Enable/Disable)     │                                 │
│     │  • Import Code (zip upload)         │                                 │
│     │  • Modules (Blog, Portfolio, etc.)  │                                 │
│     │  • Languages                        │                                 │
│     │  • Features (Dark mode, etc.)       │                                 │
│     └────────────────┬────────────────────┘                                 │
│                      │                                                      │
│                ┌─────┴─────┐                                                │
│                │           │                                                │
│                ▼           ▼                                                │
│          Greenfield    Brownfield                                           │
│                │           │                                                │
│                ▼           ▼                                                │
│         "Ready to Code"  Shows migration steps                              │
│         (key directories) (./import/ folder)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Two Modes

| Mode | Purpose | What Happens |
|------|---------|--------------|
| **BUILD** | Client projects | Opens configuration wizard |
| **DEVELOP** | PM framework work | One-click: all features enabled, sample data seeded |

---

## Setup Methods

### With Claude Code (Recommended)

```
/pm-init
```

1. Installs dependencies
2. Asks BUILD or DEVELOP
3. Sets up database
4. Starts dev server
5. BUILD mode opens browser wizard at `/init` → shows "Ready to Code" when done

### Without Claude Code

```bash
npm run init
```

Same flow as above, but without AI assistance.

### Headless (CI/CD)

For automated deployments, pass `--headless` flag:

```bash
# Basic website
npm run init -- --headless --mode=build --type=website

# Full featured website
npm run init -- --headless \
  --mode=build \
  --type=website \
  --modules=blog,portfolio,contact \
  --locales=en,es \
  --dark-mode=true

# Framework development mode
npm run init -- --headless --mode=develop
```

**Environment variables alternative:**

```bash
PM_MODE=build \
PM_TYPE=website \
PM_ADMIN=true \
PM_MODULES="blog,portfolio,contact" \
PM_LOCALES="en,ru" \
npm run init -- --headless
```

---

## Brownfield Migration

If you have an existing project to migrate into Puppet Master:

### Step 1: Setup Wizard

```
/pm-init
```

(Or `npm run init` if not using Claude Code)

In the wizard:
1. Choose **BUILD** mode
2. Upload your project as a **zip file** in the "Import Existing Code" section
3. Complete the configuration
4. Click "Apply & Start"

### Step 2: Run Migration (With Claude Code)

```
/pm-migrate
```

Claude analyzes your uploaded code and creates a comprehensive migration plan:
- Maps every component, page, API route to PM equivalents
- Identifies what can use PM native features
- Shows what needs custom implementation
- Guides you through each migration step

> **Note:** `/pm-migrate` is the key differentiator. Without Claude Code, brownfield migration is much harder.

### Without Claude Code

Your uploaded files are extracted to `./import/` folder. Reference them manually as you build your PM project:

```
./import/
├── package.json        # Check dependencies
├── src/
│   ├── components/     # Reference component logic
│   ├── pages/          # Reference page structure
│   └── api/            # Reference API endpoints
└── ...
```

---

## Commands Reference

### PM Claude Commands (Recommended)

| Command | Description |
|---------|-------------|
| `/pm-help` | **List all commands** — Shows command reference |
| `/pm-init` | **Start here** — Initialize or reconfigure project |
| `/pm-dev` | Start/restart dev server |
| `/pm-status` | Show current configuration state |
| `/pm-migrate` | AI-powered migration analysis (brownfield) |
| `/pm-team` | Multi-expert code review (7 specialists) |
| `/pm-team-all` | Complete team review (42 experts) |
| `/pm-contribute` | Export fix/feature as contribution doc |
| `/pm-apply` | Apply contribution doc to PM framework |

### Team Review Commands

**By Country:**
`/pm-il` `/pm-ru` `/pm-us` `/pm-fr` `/pm-jp` `/pm-ch`

**By Specialty:**
`/pm-ux` `/pm-frontend` `/pm-backend` `/pm-security` `/pm-devops` `/pm-fullstack` `/pm-fastapi`

### npm Scripts (Fallback / CI)

| Command | Description |
|---------|-------------|
| `npm run init` | Interactive wizard (without Claude) |
| `npm run init -- --headless` | Non-interactive, for CI/CD |
| `npm run dev` | Start development server |
| `npm run db:push` | Apply database schema |
| `npm run db:seed` | Seed sample data |

---

## Headless Options

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

---

## CI/CD Examples

### GitHub Actions

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
        run: npm run init -- --headless --mode=build --type=website --modules=blog,contact

      - name: Build
        run: npm run build

      - name: Deploy
        run: kamal deploy
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run init -- --headless --mode=build --type=website
RUN npm run build

CMD ["node", ".output/server/index.mjs"]
```

---

## Files Reference

```
scripts/
  init-cli.ts           # Interactive + headless init (unified)
  lib/
    config-writer.ts    # Writes puppet-master.config.ts
    config-reader.ts    # Reads current config

app/pages/
  init.vue              # Browser wizard page

app/middleware/
  00.init.global.ts     # Redirects unconfigured to /init

server/api/setup/
  config.get.ts         # GET current config
  config.post.ts        # POST save config
  import-zip.post.ts    # POST upload zip for brownfield
  import-zip.delete.ts  # DELETE remove uploaded zip
```

---

## Reconfiguration

To change settings after initial setup:

### Browser
Navigate to `/init` directly in your browser.

### Headless
Re-run with new options:
```bash
npm run init -- --headless --mode=build --type=app --modules=all
```

### With Claude
```bash
/pm-init --reset    # Reset to unconfigured, then reconfigure
```
