# Puppet Master System Overview

## What IS Puppet Master?

**Puppet Master is a config-driven studio toolkit for building client websites.**

It combines:
- **A Framework** — Reusable infrastructure for building websites/apps
- **A Showcase** — Working reference implementation demonstrating all capabilities

The current codebase **IS BOTH** — when you clone PM, you get a complete working website that IS the framework.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PUPPET MASTER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────┐   ┌─────────────────────────────┐         │
│   │     PM FRAMEWORK            │   │     PM SHOWCASE             │         │
│   │                             │   │                             │         │
│   │  • Nuxt3 + Nitro            │   │  • Portfolio/Agency site    │         │
│   │  • Component library        │   │  • Blog, Team, Pricing      │         │
│   │  • Admin panel system       │   │  • Complete admin panel     │         │
│   │  • Config-driven modules    │   │  • Multi-language (en,ru,he)│         │
│   │  • CSS design system        │   │  • Working content          │         │
│   │  • Claude AI integration    │   │  • Example configuration    │         │
│   │  • Setup wizard             │   │                             │         │
│   │                             │   │                             │         │
│   └─────────────────────────────┘   └─────────────────────────────┘         │
│                                                                              │
│                    SAME CODEBASE — /app directory                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Two-Mode System

PM uses a `pmMode` configuration value to determine its behavior:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           pmMode Configuration                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   'unconfigured'  ──────►  Fresh clone, needs setup                         │
│         │                  Wizard shown at /setup                            │
│         ▼                                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                    SETUP WIZARD                                   │       │
│   │                                                                   │       │
│   │   Mode Selection:                                                 │       │
│   │     ○ BUILD   - Create client project                             │       │
│   │     ○ DEVELOP - Work on PM framework                              │       │
│   │                                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│         │                                    │                               │
│         ▼                                    ▼                               │
│   'build'                              'develop'                             │
│   Client project mode                  Framework mode                        │
│   • Website OR App                     • Shows showcase site                 │
│   • Configured features                • Full PM features enabled            │
│   • Your branding                      • Example content                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### BUILD Mode (`pmMode: 'build'`)

For creating client projects:
- Choose between Website or App
- Select specific features and modules
- Configure branding (colors, fonts)
- Brownfield support (import existing code)

### DEVELOP Mode (`pmMode: 'develop'`)

For working on the PM framework:
- Shows the full showcase site
- All features enabled
- Example content and data
- Use for framework development and testing

---

## The Setup Wizard

PM includes a browser-based setup wizard at `/setup` that handles all configuration:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SETUP WIZARD FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Step 1: Mode Selection                                                     │
│   ─────────────────────                                                      │
│   BUILD (client project) or DEVELOP (framework work)                         │
│                                                                              │
│   Step 2: Project Type (BUILD only)                                          │
│   ─────────────────────────────────                                          │
│   Website (marketing site) or App (dashboard/product)                        │
│                                                                              │
│   Step 3: Import Check                                                       │
│   ────────────────────                                                       │
│   Do you have existing code? Analyzes ./import/ folder                       │
│                                                                              │
│   Step 4: Features                                                           │
│   ────────────────                                                           │
│   Select modules: Blog, Portfolio, Team, Testimonials, FAQ, etc.             │
│                                                                              │
│   Step 5: Design                                                             │
│   ───────────────                                                            │
│   Colors, fonts, icon library                                                │
│                                                                              │
│   Step 6: Review & Generate                                                  │
│   ────────────────────────                                                   │
│   Summary → Generate config → Initialize database → Redirect                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Three Setup Methods

The wizard is the primary method, but PM supports multiple setup approaches:

| Method | Best For | Command |
|--------|----------|---------|
| **Browser Wizard** | Visual configuration, first-time users | `/pm-init` or `npm run setup` |
| **CLI Prompts** | Terminal lovers, SSH sessions | `npm run setup:cli` |
| **Headless** | CI/CD, Docker, automation | `npm run setup:headless` |

All methods produce the same result: a configured `puppet-master.config.ts`.

---

## Claude Integration

### PM-Claude (Goes to Git)

**Location**: `.claude/commands/` in the PM repository

PM-Claude is a **specialized AI co-pilot** that knows the entire PM framework.

**PM-Claude Commands** (in `.claude/commands/`):

| Command | Purpose |
|---------|---------|
| `/pm-init` | Main entry point — routes to wizard or status |
| `/pm-dev` | Run development server |
| `/pm-status` | Show configuration state |
| `/pm-contribute` | Export feature/fix to PM framework |
| `/pm-apply` | Apply contribution from other project |

**These commands ARE part of the framework** — they go to Git with all other code.

### System Claude (User's Personal)

**Location**: `~/.claude/` (user's home directory)

System Claude is the **general-purpose assistant**. Does NOT go to Git.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   PM-Claude (Framework)              System Claude (User)                    │
│   ──────────────────────             ────────────────────                    │
│                                                                              │
│   .claude/commands/pm-*.md           ~/.claude/settings.local.json          │
│   .claude/config.json                ~/.claude/library/                      │
│   app/CLAUDE.md                      (User's personal prompts)               │
│                                                                              │
│   Goes to Git ✓                      Does NOT go to Git ✗                    │
│   Part of PM Framework               Per-user configuration                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Workflows

### Greenfield (New Project)

```bash
git clone puppet-master my-project
cd my-project/app
npm install

# In Claude Code:
/pm-init                    # Starts wizard
# Complete wizard in browser
# Project is configured!
```

### Brownfield (Import Existing)

```bash
git clone puppet-master my-project
cd my-project/app
cp -r ~/old-project/* ./import/
npm install

# In Claude Code:
/pm-init                    # Starts wizard
# In wizard: "Do you have existing code?" → Yes
# Wizard analyzes import folder
# Complete wizard in browser
```

### Without Claude

```bash
git clone puppet-master my-project
cd my-project/app
npm install
npm run setup               # Opens wizard in browser
```

---

## What Goes to Git

Everything that's **core framework** meant to be shared:

### Framework Code
```
app/
├── app/                    # Nuxt application
│   ├── assets/css/         # Pure CSS system (50+ files)
│   ├── components/         # Atomic Design (atoms → organisms → sections)
│   ├── composables/        # Vue composables
│   ├── layouts/            # Page layouts
│   ├── pages/              # Routes (public + admin + setup)
│   ├── plugins/            # Nuxt plugins
│   ├── types/              # Shared TypeScript types
│   └── puppet-master.config.ts  # Master configuration
├── server/                 # Nitro backend
│   ├── api/                # API routes
│   ├── database/           # Schema + seed
│   ├── middleware/         # Auth, security
│   └── utils/              # Validation, utilities
├── i18n/                   # Translation seeds
├── docs/                   # Documentation
└── ansible/                # Server provisioning
```

### Claude Integration
```
.claude/
├── commands/               # PM-specific commands
│   ├── pm-init.md
│   ├── pm-dev.md
│   ├── pm-status.md
│   ├── pm-contribute.md
│   └── pm-apply.md
└── config.json             # Project configuration

app/CLAUDE.md               # Project instructions
```

---

## What Does NOT Go to Git

Everything **project-specific, sensitive, or user-level**:

### Environment & Secrets
```
.env                        # Local environment variables
.kamal/secrets              # Deployment secrets
ansible/inventory.yml       # Server IPs and credentials
```

### Database & Data
```
data/sqlite.db              # SQLite database
public/uploads/*            # User-uploaded files
```

### User-Level Claude
```
~/.claude/                  # User's personal settings
.claude/settings.local.json # Local overrides
.claude-data/               # Session data
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | Nuxt 3 (Vue 3.5, TypeScript) |
| **Backend** | Nitro (H3 server) |
| **Database** | SQLite + Drizzle ORM |
| **Styling** | Pure CSS (OKLCH, CSS layers) |
| **Icons** | Tabler Icons |
| **Auth** | Session-based with RBAC |
| **Deployment** | Docker, Kamal, Ansible |
| **AI** | Claude Code with PM-specific commands |
| **Setup** | Browser wizard + CLI + Headless |

---

## Key Concepts

### 1. Config-Driven Architecture

Everything is controlled by `puppet-master.config.ts`:
- `pmMode` — unconfigured, build, or develop
- Project type (Website OR App)
- Admin panel enabled/disabled
- Feature toggles
- Content modules
- Color tokens
- Locale settings

### 2. Atomic Design

Components follow Atomic Design pattern:
```
atoms → molecules → organisms → sections
```

### 3. Module System

Each content feature is a complete "module":
- Database tables
- API endpoints
- Admin page
- Frontend section

Example: Blog module = posts table + /api/blog/* + /admin/blog + SectionBlog

### 4. RBAC (Role-Based Access Control)

Dynamic roles with page-level permissions:
- Built-in: Master, Admin, Editor
- Custom roles can be created
- Each role has specific page access permissions

---

## Summary

| Question | Answer |
|----------|--------|
| What is PM? | Config-driven framework + working showcase |
| Framework or template? | Both — the showcase IS the framework |
| pmMode values? | unconfigured, build, develop |
| How to set up? | `/pm-init` → wizard at `/setup` |
| Setup without Claude? | `npm run setup` |
| PM-Claude? | Specialized AI for PM (goes to Git) |
| System Claude? | User's personal settings (NOT in Git) |
| Brownfield support? | Yes, wizard handles import detection |
