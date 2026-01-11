# /pm-init — Initialize Puppet Master Project

**ACTION REQUIRED: Execute all steps below. Do NOT just describe — actually run commands.**

Main entry point for Puppet Master projects. Claude asks questions directly in chat.

## Usage

```
/pm-init              # Smart routing based on current state
/pm-init --reset      # Reset config to unconfigured state
```

---

## EXECUTE These Steps

### Step 1: Check Current Configuration

Read `puppet-master.config.ts` and check the `pmMode` field:
- `'unconfigured'` → Project needs setup (Step 2)
- `'build'` or `'develop'` → Already configured (Step 3)

---

### Step 2: If Unconfigured — Ask Mode in Chat

**Use AskUserQuestion to ask directly in Claude chat:**

Question: "What are you building?"
Header: "Mode"
Options:
- **BUILD** — Client project (website or app for a client)
- **DEVELOP** — Framework development (working on PM itself)

#### After Mode Selection:

**If BUILD selected:**

Use AskUserQuestion:
Question: "What type of project?"
Header: "Type"
Options:
- **Website** — Marketing site, landing pages, portfolio
- **App** — Dashboard, user accounts, admin features

**Then ask about features:**

Use AskUserQuestion (multiSelect: true):
Question: "Which modules do you need?"
Header: "Modules"
Options:
- Blog
- Portfolio
- Team
- Contact

#### Apply Configuration:

After collecting answers, update `puppet-master.config.ts`:

```typescript
pmMode: 'build',  // or 'develop'
projectType: 'website',  // or 'app'
modules: {
  blog: { enabled: true },
  portfolio: { enabled: true },
  // etc based on selections
}
```

#### Initialize Database:

```bash
npm run db:push
npm run db:seed
```

#### Start Dev Server:

```bash
npm run dev &
```

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         PROJECT CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Mode:     BUILD
  Type:     Website
  Modules:  Blog, Portfolio, Team

  http://localhost:3000
  http://localhost:3000/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 3: If Already Configured — Show Status

Display current configuration and use AskUserQuestion:

Question: "What would you like to do?"
Header: "Action"
Options:
- **Start dev server** (Recommended)
- **Reconfigure** — Reset and run setup again
- **View full status** — Run /pm-status

Handle selection accordingly.

---

## The --reset Flag

Use AskUserQuestion to confirm:
Question: "Reset configuration to unconfigured? Database will NOT be affected."
Options:
- Yes, reset
- Cancel

If confirmed, set `pmMode: 'unconfigured'` in config and re-run Step 2.

---

## Notes

- Mode selection happens in Claude chat, NOT in browser
- `npm run init` does the same thing via CLI prompts in terminal
- After setup, use `/pm-dev` to start server, `/pm-status` to check config
