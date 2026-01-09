# /pm start — Start Puppet Master Development Environment

**ACTION REQUIRED: Execute database setup and start dev server.**

Initializes database and starts the Puppet Master development server.

## Usage

```
/pm start               # Full start (db:push + dev server)
/pm start --fresh       # Reset database + seed + start
/pm start --no-seed     # Skip seeding (empty database)
/pm start --build       # Build for production instead of dev
```

---

## EXECUTE These Steps

### Step 1: Pre-flight Checks

#### 1.1 Check Node Modules

```bash
ls node_modules/.bin/nuxt 2>/dev/null
```

If not found:
```
📦 Installing dependencies...
```

Run:
```bash
pnpm install
```

#### 1.2 Check Configuration

```bash
ls app/puppet-master.config.ts 2>/dev/null
```

If not found:
```
⚠️  No puppet-master.config.ts found.
    Run /pm init first to configure your project.
```

Exit if no config.

#### 1.3 Check for Running Server

```bash
lsof -i :3000 2>/dev/null | grep LISTEN
```

If server already running:
```
⚠️  Dev server already running on :3000

Options:
  1. Keep current server
  2. Restart server (/restartdev)
  3. Stop server (/closedev)
```

Use AskUserQuestion if server is running.

---

### Step 2: Database Setup

#### 2.1 Check Database State

```bash
ls data/sqlite.db 2>/dev/null
```

#### 2.2 If --fresh Flag

```
🗑️  Resetting database...
```

```bash
rm -f data/sqlite.db
```

#### 2.3 Run Migrations

```
📊 Applying database migrations...
```

```bash
pnpm run db:push
```

Check for errors. If migration fails, report and stop.

#### 2.4 Seed Data (unless --no-seed)

Check if database is empty:
```bash
# Check if users table has data
sqlite3 data/sqlite.db "SELECT COUNT(*) FROM users;" 2>/dev/null
```

If empty and not --no-seed:
```
🌱 Seeding sample data...
```

```bash
pnpm run db:seed
```

If --no-seed:
```
ℹ️  Skipping seed (--no-seed flag)
    Database will be empty except for default master user.
```

---

### Step 3: Start Development Server

If NOT --build:

```
🚀 Starting development server...
```

Use the /rundev pattern (background process):

```bash
pnpm run dev
```

Run in background, capture task ID.

---

### Step 4: If --build Flag

```
📦 Building for production...
```

```bash
pnpm run build
```

Then optionally preview:
```
Build complete! Preview with:
  pnpm run preview
```

---

### Step 5: Verify Startup

Wait for server to be ready:

```bash
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If 200:
```
✅ Server is ready!
```

If not responding:
```
⏳ Server still starting... (check logs with /rundev status)
```

---

### Step 6: Display Success

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      ✅ PUPPET MASTER RUNNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🌐 Website:     http://localhost:3000
  🔐 Admin:       http://localhost:3000/admin
  📊 DB Studio:   Run `pnpm run db:studio`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Mode:          {mode}
  Database:      ✅ Ready ({table_count} tables)
  Seed Data:     {seeded ? "✅ Loaded" : "❌ Empty"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Default Login (dev only):
  Email:         master@example.com
  Password:      master123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
  /pm status     Check current configuration
  /restartdev    Restart dev server
  /closedev      Stop dev server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Flags

### --fresh

Complete reset:
1. Delete existing database
2. Run migrations
3. Seed with sample data
4. Start server

Use when you want a clean slate.

### --no-seed

Skip the seeding step. Database will only have:
- Schema (tables created)
- Default master user (if seed creates one)

Useful for production-like testing.

### --build

Build for production instead of starting dev server.
Runs `pnpm run build`.
Does not start a server (use `pnpm run preview` manually).

---

## Error Handling

### Migration Fails

```
❌ Database migration failed:

{error_message}

Possible fixes:
  1. Check schema syntax in server/database/schema.ts
  2. Delete data/sqlite.db and try again
  3. Run `pnpm run db:studio` to inspect database

Run /pm start --fresh to reset and try again.
```

### Port In Use

```
❌ Port 3000 is already in use.

Options:
  1. Stop existing process: /closedev
  2. Use different port: PORT=3001 pnpm run dev
  3. Find process: lsof -i :3000
```

### Missing Dependencies

```
❌ Missing dependencies.

Run: pnpm install
Then try /pm start again.
```

---

## Notes

- Always check for existing server before starting
- Run migrations before starting (ensures schema is current)
- Seed only on empty database (don't duplicate data)
- Show default credentials only in dev mode
- Background the dev server process
