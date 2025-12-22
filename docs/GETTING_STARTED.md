# Getting Started

This guide walks you through setting up Puppet Master for local development.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | LTS recommended |
| pnpm | 8+ | Or npm/yarn |
| Git | Latest | For version control |

Optional for deployment:
- Ruby 3.2+ (for Kamal)
- Ansible 2.15+ (for server provisioning)
- Docker (for containerization)

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd puppet-master
```

### 2. Install Dependencies

```bash
cd app
pnpm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

For local development, the defaults work out of the box. The database will be created at `./data/sqlite.db`.

### 4. Initialize Database

```bash
# Apply database schema
pnpm db:push

# Seed initial data (users, settings, translations)
pnpm db:seed
```

This creates:
- 4 example users (master, admin, editor, john)
- Default settings values
- System and content translations for all languages
- Sample portfolio items

### 5. Start Development Server

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

---

## Default Accounts

After seeding, these accounts are available:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| master@example.com | master123 | Master | Full access (developer) |
| admin@example.com | admin123 | Admin | Client access |
| editor@example.com | editor123 | Editor | Content only |
| john@example.com | john123 | Editor | Additional editor |

### Role Hierarchy

```
Master (level 2) > Admin (level 1) > Editor (level 0)
```

- **Master**: Developers/agency - full system access
- **Admin**: Client owners - can manage users (except master)
- **Editor**: Client employees - content editing only

---

## Project Structure

```
app/
├── app/                      # Nuxt app directory
│   ├── assets/css/           # CSS system
│   ├── components/           # Vue components
│   ├── composables/          # Vue composables
│   ├── layouts/              # Page layouts
│   ├── pages/                # Route pages
│   ├── middleware/           # Client middleware
│   └── puppet-master.config.ts  # Main config
├── server/                   # Backend
│   ├── api/                  # API endpoints
│   ├── database/             # Schema, seed
│   ├── middleware/           # Server middleware
│   ├── plugins/              # Server plugins
│   └── utils/                # Utilities
├── i18n/                     # Translations
├── public/                   # Static assets
├── docs/                     # Documentation
└── tests/                    # Tests
```

---

## Key Configuration Files

### `puppet-master.config.ts`

The central configuration file. Controls:
- Application mode (app-only, website-admin, etc.)
- Feature toggles (multi-lang, theme, onepager, etc.)
- Locale settings
- Color primitives
- Settings schema
- Navigation structure

### `.env`

Runtime environment variables:
- Database path
- SMTP settings (for emails)
- Telegram bot (for notifications)
- S3 storage (for cloud uploads)

### `nuxt.config.ts`

Nuxt-specific configuration:
- Modules (i18n, color-mode, PWA)
- Build settings
- Runtime config

---

## Development Workflow

### Making Changes

1. **Components**: Add to `app/components/` following atomic design
2. **Styles**: Add CSS files to `app/assets/css/` (never use scoped styles)
3. **API Routes**: Add to `server/api/`
4. **Translations**: Edit via admin panel or `i18n/` files

### Database Changes

```bash
# After modifying server/database/schema.ts
pnpm db:push

# View database with GUI
pnpm db:studio
```

### Running Tests

```bash
pnpm test          # All tests (interactive)
pnpm test:run      # All tests (CI mode)
pnpm test:unit     # Unit tests only
pnpm test:api      # API tests only
pnpm test:e2e      # E2E tests only
```

### Building for Production

```bash
pnpm build         # Build
pnpm preview       # Preview build locally
```

---

## Accessing the Admin Panel

Depending on your application mode:

| Mode | Website | Admin Access |
|------|---------|--------------|
| `app-only` | No | Root (`/`) redirects to login |
| `website-app` | Yes | Login button visible in header |
| `website-admin` | Yes | Hidden at `/admin/login` |
| `website-only` | Yes | No admin access |

For `website-admin` mode (default), go to:
```
http://localhost:3000/admin/login
```

---

## Common Tasks

### Change Brand Colors

Edit `app/assets/css/colors/primitives.css`:

```css
:root {
  --p-brand: #your-brand-color;
  --p-accent: #your-accent-color;
}
```

All other colors are auto-calculated from these 4 primitives.

### Add a New Language

1. Add to `puppet-master.config.ts`:
```typescript
locales: [
  // existing...
  { code: 'de', iso: 'de-DE', name: 'Deutsch', dir: 'ltr' }
]
```

2. Add translations in admin panel or seed file

3. Add logo variants (optional):
```
public/logo/horizontal_dark_de.svg
public/logo/horizontal_light_de.svg
public/logo/circle_dark_de.svg
public/logo/circle_light_de.svg
```

### Enable Email Notifications

In `.env`:
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your-password
SMTP_FROM="Site Name <noreply@example.com>"
```

### Enable Telegram Notifications

1. Create bot via [@BotFather](https://t.me/botfather)
2. Get chat ID via [@userinfobot](https://t.me/userinfobot)
3. In `.env`:
```bash
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789
```

---

## Troubleshooting

### Database Errors

```bash
# Reset database completely
pnpm db:reset

# Or manually delete and recreate
rm -rf data/sqlite.db
pnpm db:push
pnpm db:seed
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 pnpm dev
```

### Missing Dependencies

```bash
# Clean install
rm -rf node_modules
pnpm install
```

### Type Errors

```bash
# Run type check
pnpm typecheck

# Regenerate types
pnpm nuxi prepare
```

---

## Next Steps

1. **[Configuration Guide](CONFIGURATION.md)** - Full config reference
2. **[CSS Architecture](styles/CSS_ARCHITECTURE.md)** - Understand the CSS system
3. **[API Reference](API_REFERENCE.md)** - All API endpoints
4. **[Deployment](DEPLOYMENT.md)** - Deploy to production
