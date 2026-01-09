# /pm init — Initialize Puppet Master Project

**ACTION REQUIRED: Execute all steps below. Do NOT just describe — actually run commands, read files, and update configurations.**

Guided setup wizard for new Puppet Master projects. Asks questions to configure `puppet-master.config.ts`.

## Usage

```
/pm init                # Full guided setup
/pm init --minimal      # Quick setup with defaults
/pm init --reset        # Reset config to defaults
```

---

## EXECUTE These Steps

### Step 0: Check Current State

Read current config to understand existing setup:

```bash
cat app/puppet-master.config.ts 2>/dev/null | head -50
```

If config exists and has customizations, warn:
```
⚠️  Existing configuration detected.
    Running /pm init will modify your puppet-master.config.ts

    Current mode: {detected_mode}
    Modules enabled: {count}

    Continue? [y/N]
```

---

### Step 1: Application Mode

Ask user to select application mode:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         PUPPET MASTER SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1/5: Application Mode

What type of project are you building?

  1. app-only
     Dashboard, SaaS, internal tool
     → No public website, login is the entry point

  2. website-app
     Public site + user login area
     → Marketing site with visible login button

  3. website-admin
     Public site + hidden admin panel
     → Client manages content via /admin (not visible to visitors)

  4. website-only
     Static marketing site
     → No authentication, no admin panel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Use AskUserQuestion tool with options:
- `app-only` — Dashboard, SaaS, internal tool
- `website-app` — Public site + user login area
- `website-admin` — Public site + hidden admin (Recommended for client sites)
- `website-only` — Static marketing site

Store selection for config generation.

---

### Step 2: Features

Based on mode, ask about features:

```
Step 2/5: Features

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
Step 3/5: Content Modules

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
Step 4/5: Languages

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

### Step 5: Data Source

Ask about data source strategy:

```
Step 5/5: Data Source

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

### Step 6: Generate Configuration

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
