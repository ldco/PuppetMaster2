# /pm status — Show Puppet Master Configuration Status

**ACTION REQUIRED: Read configuration and display current state clearly.**

Quick overview of current Puppet Master configuration and project state.

## Usage

```
/pm status              # Full status overview
/pm status --config     # Show raw config values
/pm status --modules    # Show module details only
/pm status --db         # Show database status
```

---

## EXECUTE These Steps

### Step 1: Read Configuration

Read the main config file:

```bash
cat app/puppet-master.config.ts
```

Parse and extract:
- `mode` — Current application mode
- `features` — Enabled features
- `modules` — Enabled modules
- `locales` — Configured languages
- `dataSource.provider` — Data source type
- `sections` — Configured sections

---

### Step 2: Check Database Status

```bash
# Check if database exists
ls data/sqlite.db 2>/dev/null

# Check migration status
ls server/database/migrations/*.sql 2>/dev/null | wc -l
```

---

### Step 3: Check Dev Server

```bash
# Check if dev server is running
lsof -i :3000 2>/dev/null | grep LISTEN
```

---

### Step 4: Check Migration Status

```bash
# Check if migration is in progress
cat .claude-data/migration.json 2>/dev/null
```

---

### Step 5: Display Status

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         📊 PUPPET MASTER STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mode:           website-admin
Data Source:    database (SQLite)
Dev Server:     ● Running on :3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Features:
  ✅ Multilingual     3 locales (en, ru, he)
  ✅ Dark Mode        Enabled
  ❌ PWA              Disabled
  ✅ Contact Notify   Email + Telegram

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modules:
  ✅ portfolio        Gallery + Case Studies
  ✅ blog             Posts, Categories, Tags
  ✅ team             Member Profiles
  ✅ pricing          Tiers + Comparison
  ✅ testimonials     Customer Reviews
  ✅ faq              Accordion FAQ
  ✅ clients          Logo Showcase
  ✅ features         Feature Cards
  ✅ contact          Form + Notifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sections (Navigation Order):
  1. hero
  2. portfolio
  3. features
  4. team
  5. testimonials
  6. pricing
  7. faq
  8. contact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database:
  ✅ SQLite exists    data/sqlite.db (2.4 MB)
  ✅ Migrations       12 applied
  ✅ Seeded           Sample data present

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
  /pm init            Reconfigure project
  /pm start           Restart dev environment
  /pm migrate         Import existing project

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### If Migration In Progress

Add migration section:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Migration In Progress:
  Source:         ./import/ (Next.js 14)
  Phase:          3/7 — Core Pages
  Tasks Done:     8/23

  Run /pm migrate --resume to continue

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Flags

### --config

Show raw configuration values in a table format.
Useful for debugging.

### --modules

Show detailed module configuration:
- Enabled/disabled state
- Module-specific options
- Content counts (if database exists)

### --db

Show database details:
- Table counts
- Row counts per table
- Last migration applied
- Database file size

---

## Notes

- Always read fresh from config file (don't cache)
- Show actionable next steps based on state
- Indicate if something needs attention (missing db, server not running)
- Keep output concise but informative
