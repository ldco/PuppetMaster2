# PM Setup Workflows

How to configure a Puppet Master project.

---

## Quick Start

```bash
git clone puppet-master my-project
cd my-project/app
npm run init
```

That's it! `npm run init` handles everything.

---

## The Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  npm run init                                                               │
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

### Interactive (Recommended)

```bash
npm run init
```

1. Installs dependencies
2. Asks BUILD or DEVELOP in terminal
3. Sets up database
4. Starts dev server
5. BUILD mode opens browser wizard at `/init` → shows "Ready to Code" when done

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

```bash
npm run init
```

In the wizard:
1. Choose **BUILD** mode
2. Upload your project as a **zip file** in the "Import Existing Code" section
3. Complete the configuration
4. Click "Apply & Start"

### Step 2: Run Migration (After Wizard)

**With Claude Code:**

```bash
/pm-migrate
```

Claude analyzes your uploaded code and creates a comprehensive migration plan:
- Maps every component, page, API route to PM equivalents
- Identifies what can use PM native features
- Shows what needs custom implementation
- Guides you through each migration step

**Without Claude Code:**

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

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run init` | Interactive wizard (recommended) |
| `npm run init -- --headless` | Non-interactive, for CI/CD |
| `npm run dev` | Start development server |
| `npm run db:push` | Apply database schema |
| `npm run db:seed` | Seed sample data |

### Claude Code Commands

| Command | Description |
|---------|-------------|
| `/pm-init` | Check config + ask BUILD or DEVELOP + start dev server |
| `/pm-dev` | Start/restart dev server |
| `/pm-migrate` | AI-powered migration analysis (for brownfield) |
| `/pm-status` | Show current configuration state |

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
