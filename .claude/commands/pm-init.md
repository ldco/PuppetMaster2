# /pm-init — Initialize Puppet Master Project

**ACTION REQUIRED: Execute all steps below. Do NOT just describe — actually run commands and guide the user.**

Main entry point for Puppet Master projects. Detects current state and routes to appropriate action.

## Usage

```
/pm-init              # Smart routing based on current state
/pm-init --reset      # Reset config to unconfigured state
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           /pm-init Flow                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Read puppet-master.config.ts                                               │
│              │                                                               │
│              ▼                                                               │
│   ┌──────────────────────┐                                                   │
│   │  pmMode value?       │                                                   │
│   └──────────────────────┘                                                   │
│          │       │       │                                                   │
│    unconfigured  │     build/develop                                         │
│          │       │       │                                                   │
│          ▼       │       ▼                                                   │
│    Start dev     │    Show status                                            │
│    + open wizard │    + ask what to do                                       │
│                  │                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## EXECUTE These Steps

### Step 1: Check Current Configuration

Read the config file to determine current state:

```
Read: app/puppet-master.config.ts
```

Look for the `pmMode` field:
- `'unconfigured'` → Project needs setup (Step 2)
- `'build'` → Already configured for client project (Step 3)
- `'develop'` → Already configured for framework development (Step 3)

---

### Step 2: If Unconfigured — Start Wizard

Display welcome message:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         🎭 PUPPET MASTER SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome! This project needs to be configured.

I'll start the development server and open the setup wizard in your browser.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 2.1 Install Dependencies

First, check if dependencies are installed:

```bash
ls node_modules/.bin/nuxt 2>/dev/null
```

If `node_modules/.bin/nuxt` does NOT exist, run:

```
📦 Installing dependencies...
```

```bash
npm install
```

Wait for install to complete before proceeding.

#### 2.2 Check for Running Server

```bash
lsof -i :3000 2>/dev/null | grep LISTEN
```

If server already running, kill it:
```bash
pkill -f "nuxt" || true
sleep 1
```

#### 2.3 Start Development Server

```bash
npm run dev &
```

Wait for server to be ready:
```bash
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/setup
```

#### 2.4 Display Wizard Instructions

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         🌐 WIZARD READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Open in browser:  http://localhost:3000/setup

  The wizard will guide you through:
    1. Mode Selection — BUILD (client project) or DEVELOP (framework)
    2. Project Type — Website or App (if BUILD mode)
    3. Import Check — Do you have existing code?
    4. Features — Select modules (blog, portfolio, team, etc.)
    5. Design — Colors, fonts, icon library
    6. Review — Summary and generate

  After completion, your puppet-master.config.ts will be updated
  and you'll be redirected to your configured site.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Commands while wizard is running:
    /pm-status    Check current configuration
    /pm-dev       Restart dev server
    /closedev     Stop dev server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Stop here — user completes wizard in browser.**

---

### Step 3: If Already Configured — Show Status and Options

If `pmMode` is `'build'` or `'develop'`, display current status:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         📊 PROJECT ALREADY CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Mode:        {BUILD | DEVELOP}
  Type:        {Website | App}
  Admin:       {Enabled | Disabled}
  Features:    {count} enabled
  Modules:     {list}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask what the user wants to do:

Use AskUserQuestion with options:
- **Start dev server** — Run `npm run dev` (Recommended)
- **Reconfigure** — Open wizard at /setup
- **View full status** — Run /pm-status
- **Reset to unconfigured** — Clear config and start over

**Handle selection:**
- Start dev server → Run `/pm-dev` steps
- Reconfigure → Start server and direct to `/setup`
- View full status → Run `/pm-status` steps
- Reset → Confirm, then set `pmMode: 'unconfigured'` and re-run `/pm-init`

---

## The --reset Flag

Resets the project to unconfigured state:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ⚠️  RESET CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This will reset puppet-master.config.ts to unconfigured state.

Your database and content will NOT be affected.

Continue? [y/N]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If confirmed:
1. Edit `puppet-master.config.ts` to set `pmMode: 'unconfigured'`
2. Re-run `/pm-init` flow

---

## Wizard Steps (What Happens in Browser)

The browser wizard at `/setup` handles:

### Step 1: Mode Selection
- **BUILD** — Creating a client project (website or app)
- **DEVELOP** — Working on the PM framework itself

### Step 2: Project Type (if BUILD)
- **Website** — Marketing site, landing pages
- **App** — Dashboard, user features

### Step 3: Import Check (Brownfield Detection)
- **Fresh start** — No existing code
- **Import existing** — Analyze `./import/` folder

If importing, the wizard:
- Scans the import folder
- Shows found files (components, pages, API routes)
- Creates a migration plan
- Applies configuration based on detected features

### Step 4: Feature Selection
Multi-select checkboxes for:
- Blog, Portfolio, Team, Testimonials, FAQ
- Pricing, Clients, Features, Contact
- Multilingual, Dark Mode, PWA

### Step 5: Design
- Primary brand color
- Accent color
- Font selections
- Icon library

### Step 6: Review & Generate
- Summary of all selections
- Generate button updates config
- Database migrations run
- Redirect to configured site

---

## After Wizard Completes

Once the wizard finishes:

1. `puppet-master.config.ts` is updated with:
   - `pmMode: 'build'` or `'develop'`
   - All feature/module selections
   - Design tokens

2. Database is initialized:
   - Schema applied (`db:push`)
   - Sample data seeded (`db:seed`)

3. User is redirected to:
   - BUILD mode → Site homepage or `/admin`
   - DEVELOP mode → Showcase site

---

## Notes

- The wizard is the PRIMARY setup method
- `/pm-init` just routes to the wizard
- Wizard handles both greenfield AND brownfield in same flow
- After setup, use `/pm-dev` to start server, `/pm-status` to check config
