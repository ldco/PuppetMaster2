# /pm-init — Initialize Puppet Master Project

**ACTION REQUIRED: Execute all steps below. Do NOT just describe — actually run commands, read files, and update configurations.**

Guided setup wizard for new Puppet Master projects. Analyzes requirements or asks questions to configure `puppet-master.config.ts`.

## Usage

```
/pm-init                # Smart setup (detects PROJECT.md or asks questions)
/pm-init --minimal      # Quick setup with defaults
/pm-init --reset        # Reset config to defaults
```

---

## EXECUTE These Steps

### Step 0: Check Import Folder State

**First, check what's in the `./import/` folder:**

```
Glob: import/**/*
```

**Determine the state:**

1. **Has code files** (package.json, src/, pages/, components/, etc.):
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         📦 CODE DETECTED IN IMPORT FOLDER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   You have existing code in ./import/. This looks like a Brownfield migration.

   Run /pm-migrate instead to:
     • Decompose the existing project
     • Map to PM capabilities
     • Create a migration plan

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
   **Stop here — user should run `/pm-migrate`.**

2. **Has code AND PROJECT.md filled**:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ⚠️  CONFLICTING STATE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   The import folder contains BOTH code and a PROJECT.md specification.
   Please choose one approach:

   OPTION A: Migrate existing code (Brownfield)
   ────────────────────────────────────────────
   Remove or rename PROJECT.md, then run /pm-migrate

   OPTION B: Build new project from spec (Greenfield)
   ──────────────────────────────────────────────────
   Remove the code files, keep PROJECT.md, then run /pm-init again

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
   **Stop here — user needs to resolve the conflict.**

3. **Has PROJECT.md with content** (sections filled out):
   → **GREENFIELD WITH ANALYSIS** — Skip to Step 0G

4. **Has empty PROJECT.md or nothing** (just template/gitkeep):
   → **GREENFIELD WITH WIZARD** — Continue to Step 1

---

## Step 0G: Greenfield with PROJECT.md Analysis

**If PROJECT.md exists and is filled out, analyze requirements instead of asking questions.**

### 0G.1 Read and Parse PROJECT.md

Read `import/PROJECT.md` completely. Extract:

- Project name and description
- Target users
- Application type (app-only, website-app, website-admin, website-only)
- Pages/sections needed (checked items)
- Features requested (checked items)
- Content modules needed (checked items)
- Design preferences (colors, typography, style)
- Data requirements
- External integrations
- Technical requirements
- Special requirements

### 0G.2 Display Requirements Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    🌱 GREENFIELD PROJECT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: {name}
Client:  {client}
Type:    {mode}

REQUIREMENTS DETECTED
─────────────────────────────────────────────────────────────────────────────
  Pages/Sections: {list}
  Features:       {list}
  Modules:        {list}
  Languages:      {list or "English only"}
  Integrations:   {list or "None"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 0G.3 Map Requirements to PM Capabilities

Create a mapping table showing what PM provides vs what needs to be built:

```
CAPABILITY MAPPING
─────────────────────────────────────────────────────────────────────────────
| Requirement          | PM Status     | Action       | Notes              |
|─────────────────────|───────────────|──────────────|────────────────────|
| Hero section        | PM_EXISTS     | Configure    | SectionHero        |
| About page          | PM_EXISTS     | Configure    | SectionAbout       |
| Blog                | PM_EXISTS     | Enable       | Blog module        |
| Custom booking      | NOT_IN_PM     | CREATE       | New feature        |
| Stripe payments     | NOT_IN_PM     | INTEGRATE    | Add library        |
| Dark mode           | PM_EXISTS     | Enable       | Built-in           |
| German language     | PM_EXISTS     | Configure    | Add locale         |
...
```

**Status values:**
- `PM_EXISTS` — PM has this, just configure/enable
- `PM_NATIVE` — Use PM's showcase implementation
- `NOT_IN_PM` — Needs to be built or integrated
- `PARTIAL` — PM has basics, needs extension

**Action values:**
- `Configure` — Just update config
- `Enable` — Turn on existing module
- `CREATE` — Build new component/feature
- `INTEGRATE` — Add external library/service
- `EXTEND` — Extend existing PM feature

### 0G.4 Identify Gaps and Suggest Solutions

For each `NOT_IN_PM` or `PARTIAL` item, suggest:

```
IMPLEMENTATION PLAN
─────────────────────────────────────────────────────────────────────────────

1. CUSTOM BOOKING SYSTEM (CREATE)
   Approach: Create new module with calendar component
   Effort: Medium
   Libraries: @fullcalendar/vue3 or build custom
   Files to create:
   - app/components/organisms/BookingCalendar.vue
   - server/api/bookings/[...].ts
   - server/database/schema additions

2. STRIPE PAYMENTS (INTEGRATE)
   Approach: Add Stripe SDK, create checkout flow
   Effort: Medium
   Libraries: @stripe/stripe-js, stripe (server)
   Files to create:
   - server/api/payments/create-session.ts
   - app/components/molecules/PaymentButton.vue
...
```

### 0G.5 Ask Clarifying Questions

Use AskUserQuestion for any unclear requirements:

```
I have some questions about your project:

1. For the booking system, do you need:
   ○ Simple date picker (select available dates)
   ○ Full calendar with time slots
   ○ Integration with external calendar (Google, etc.)

2. For payments, which provider?
   ○ Stripe (Recommended)
   ○ PayPal
   ○ Both
   ○ Other
```

### 0G.6 Generate Implementation Plan

Create `.claude-data/implementation-plan.md` with:

```markdown
# Implementation Plan: {Project Name}

## Overview
- Type: {mode}
- Generated: {date}

## Phase 1: Configuration
1. Set application mode to {mode}
2. Enable features: {list}
3. Enable modules: {list}
4. Configure languages: {list}
5. Set color palette

## Phase 2: PM Native Setup
{List of sections/pages that just need configuration}

## Phase 3: Custom Development
{List of features to build, with detailed steps}

## Phase 4: Integrations
{External services to connect}

## Phase 5: Content & Launch
{Data seeding, testing, deployment}

## Checklist
- [ ] Phase 1 complete
- [ ] Phase 2 complete
...
```

### 0G.7 Update Configuration

Based on analysis, update `puppet-master.config.ts`:
- Set mode
- Enable detected features
- Enable detected modules
- Set locales if multilingual
- Set color tokens if provided

**Skip to Step 7 (Summary).**

---

## Step 0W: Check Current Config State

**For wizard mode, check existing config:**

Read current config to understand existing setup:

```bash
cat app/puppet-master.config.ts 2>/dev/null | head -50
```

If config exists and has customizations, warn:
```
⚠️  Existing configuration detected.
    Running /pm-init will modify your puppet-master.config.ts

    Current mode: {detected_mode}
    Modules enabled: {count}

    Continue? [y/N]
```

---

## Step 1: Project Entities

**First, understand WHAT the project needs (entities), then derive the mode.**

Display architecture overview:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         PUPPET MASTER SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1/6: Project Entities

PM projects can have THREE entities:

  WEBSITE    Public pages (marketing, landing, info)
             → Visitors see this without logging in

  APP        User features (dashboard, tracker, tools)
             → Users log in to access their features

  ADMIN      Content management layer
             → Editors/admins manage website and/or app content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Ask about each entity:**

Use AskUserQuestion with multiSelect: true:
- **Public Website** — Marketing pages, landing page, about, contact
- **User Application** — Features users log in to use (dashboard, tracker, etc.)
- **Content Management** — Admin panel to manage content (Recommended)

**Derive mode from selection:**

| Selection | Mode |
|-----------|------|
| App only | `app-only` |
| Website + App | `website-app` |
| Website + Admin | `website-admin` |
| Website only | `website-only` |
| Website + App + Admin | `website-app` (admin at /admin/*) |
| App + Admin | `app-only` (admin sections integrated) |

**If Website + App selected, ask follow-up:**

```
You have both a public website AND a user application.

How should the login button appear?

  1. Visible — Login button in website header
     → Users see and click to access app

  2. Hidden — No login button, users access /login directly
     → For apps where users already know the URL
```

Store selection for config generation.

---

### Step 2: Features

Based on mode, ask about features:

```
Step 2/7: Features

Enable features for your project:

  ☐ Multilingual (i18n)
    Multiple language support with database-driven translations

  ☐ Dark Mode
    Light/dark theme toggle with system preference detection

  ☐ PWA
    Progressive Web App with offline support

  ☐ Contact Notifications
    Email and/or Telegram notifications for contact form
```

Use AskUserQuestion with multiSelect: true for:
- Multilingual (i18n)
- Dark Mode
- PWA
- Contact Notifications (email/Telegram)

---

### Step 3: Content Modules

Ask which content modules to enable:

```
Step 3/7: Content Modules

Which content sections do you need?

  ☐ Portfolio / Gallery
    Project showcase with images, videos, case studies

  ☐ Blog
    Articles with categories, tags, markdown support

  ☐ Team
    Team member profiles with photos and social links

  ☐ Pricing
    Pricing tiers with feature comparison

  ☐ Testimonials
    Customer reviews with ratings

  ☐ FAQ
    Frequently asked questions (accordion style)

  ☐ Clients / Partners
    Logo showcase for clients, sponsors, partners

  ☐ Features
    Feature cards highlighting capabilities
```

Use AskUserQuestion with multiSelect: true.

---

### Step 4: Locales (if multilingual enabled)

If user selected multilingual in Step 2:

```
Step 4/7: Languages

Which languages do you need?

  ☐ English (en)
  ☐ Russian (ru)
  ☐ Hebrew (he) — RTL supported
  ☐ Spanish (es)
  ☐ French (fr)
  ☐ German (de)
  ☐ Arabic (ar) — RTL supported
  ☐ Chinese (zh)

  Default language: [en]
```

Use AskUserQuestion with multiSelect: true.
Ask follow-up for default locale.

If multilingual NOT enabled, skip to Step 5.

---

### Step 5: App UX Preferences (if App or Admin enabled)

**Only ask if user selected User Application or Content Management.**

```
Step 5/7: App UX Preferences

How should the authenticated area look?

PM has TWO UX paradigms:
- Website UX: Horizontal header, page-based (for public pages)
- App UX: Sidebar/bottom nav, feature-based (for logged-in users)

For your APP features, which visual style?

  1. Sidebar (Recommended for many features)
     Desktop: Vertical sidebar | Mobile: Bottom navigation
     → Best for 3+ features, admin panels

  2. Minimal Header
     Horizontal header with minimal nav
     → Best for single-feature apps, simple dashboards

  3. Full Header
     Horizontal header with dropdown menus
     → Best for apps with grouped features
```

Use AskUserQuestion with options:
- Sidebar — Vertical sidebar (desktop) + bottom nav (mobile)
- Minimal Header — Simple horizontal header
- Full Header — Horizontal with dropdowns

**Important clarification:**
```
NOTE: Both regular users AND admins use App UX.
The layout defines WHERE navigation goes.
User ROLE defines WHAT navigation shows.

Example with Sidebar layout:
- Regular user sees: Dashboard, Settings
- Admin sees: Dashboard, Settings, Content, Users
```

Store selection for layout configuration.

---

### Step 6: Data Source

Ask about data source strategy:

```
Step 6/7: Data Source

Where will your content come from?

  1. database (Recommended)
     SQLite with Drizzle ORM — zero config, everything local

  2. api
     External REST API — for existing backend integration

  3. hybrid
     Mix of both — auth local, content from API
```

Use AskUserQuestion with options.

---

### Step 7: Generate Configuration

Based on collected answers, update `puppet-master.config.ts`:

**Read current config:**
```typescript
// Read app/puppet-master.config.ts
```

**Update these sections:**

1. `mode` — Set to selected mode
2. `features` — Enable selected features
3. `modules` — Enable selected modules with `enabled: true`
4. `locales` — Set locale array and default
5. `dataSource.provider` — Set data source

**Use Edit tool** to update the config file with user selections.

---

### Step 7: Summary & Next Steps

Display summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      ✅ PUPPET MASTER CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Configuration saved to puppet-master.config.ts

  Mode:       {mode}
  Features:   {feature_list}
  Modules:    {module_list}
  Languages:  {locale_list}
  Data:       {data_source}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
  /pm start     Initialize database and start dev server
  /pm status    Review current configuration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask if user wants to run `/pm start` now.

---

## Flags

### --minimal

Skip questions, use smart defaults:
- Mode: `website-admin`
- Features: multilingual, darkMode
- Modules: portfolio, blog, contact
- Locales: en (default)
- Data: database

Just confirm and apply.

### --reset

Reset `puppet-master.config.ts` to factory defaults.
Confirm before proceeding.

---

## Notes

- Always read existing config before modifying
- Use Edit tool for surgical updates, not full file rewrites
- Validate module dependencies (e.g., blog needs categories)
- After config changes, remind user to run `/pm start`
