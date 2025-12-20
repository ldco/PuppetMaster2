# 🎭 Puppet Master - Best Practices

Quick reference for development standards and conventions.

> **📖 Full CSS Documentation:** See `docs/styles/` folder for comprehensive CSS system docs.

---

## CSS Rules

### 1. NO Scoped Styles in Components

**CRITICAL**: Never use `<style scoped>` in Vue components.

```vue
<!-- ❌ WRONG -->
<style scoped>
.footer {
  padding: 1rem;
}
</style>

<!-- ✅ CORRECT -->
<!-- All styles go in skeleton CSS files -->
<!-- app/assets/css/skeleton/footer.css -->
```

**Exception**: Scoped styles are ONLY allowed for custom sections on client sites with heavy custom graphics.

### 2. Use CSS Variables Only

Never hardcode values. Always use variables from our CSS system.

```css
/* ❌ WRONG */
padding: 16px;
margin-top: 24px;
color: #333;

/* ✅ CORRECT */
padding: var(--space-4);
margin-block-start: var(--space-6);
color: var(--l-text-muted);
```

### 3. One File Per Component (Modular CSS)

Each CSS component has its own dedicated file. This makes customization easy:

| Component      | File Location              |
| -------------- | -------------------------- |
| Admin sidebar  | `layout/admin-sidebar.css` |
| Admin header   | `layout/admin-header.css`  |
| Icon sizes     | `common/icons.css`         |
| Text utilities | `common/text.css`          |
| Tab component  | `ui/content/tabs.css`      |

### 4. Responsive Rules in Same File

Keep base styles and media queries together in the same file:

```css
/* admin-sidebar.css */
.admin-sidebar {
  display: flex;
  width: var(--admin-sidebar-width);
}

@media (--phone) {
  .admin-sidebar {
    display: none;
  }
}
```

**Note:** `(--phone)`, `(--tablet)`, `(--desktop)` are PostCSS custom media queries defined in `layout/breakpoints.css`. They compile to standard media queries via `postcss-preset-env`.

```css
/* What you write */
@media (--phone) { ... }

/* What browser receives */
@media (max-width: 639px) { ... }
```

### 5. CSS Layers

Use `@layer` for cascade control:

```css
@layer reset, primitives, semantic, components, utilities;
```

| Layer        | Purpose                             |
| ------------ | ----------------------------------- |
| `reset`      | Browser normalize                   |
| `primitives` | Raw tokens (colors, fonts)          |
| `semantic`   | Calculated values                   |
| `components` | UI styling                          |
| `utilities`  | Override helpers (highest priority) |

### 6. Use Logical Properties for RTL

Always use CSS logical properties for RTL language support:

```css
/* ❌ WRONG */
margin-left: 1rem;
border-top: 1px solid;
padding-right: 2rem;

/* ✅ CORRECT */
margin-inline-start: 1rem;
border-block-start: 1px solid;
padding-inline-end: 2rem;
```

---

## Component Architecture

### Atomic Design

- **Atoms**: Smallest pieces (Logo, NavLink, ThemeToggle)
- **Molecules**: Composed atoms (NavLinks, SocialNav, HeaderActions)
- **Organisms**: Complete sections (TheHeader, TheFooter, MobileNav)
- **Templates**: Smart switchers (TheHeader choosing Desktop/Mobile)

### Logo System

- `headerLogo` - Full horizontal logo for header
- `shortLogo` - Compact circle/icon for sidebar, footer, narrow spaces
- NOT "mobileLogo" - the term is `shortLogo`

### Navigation Config

- `verticalNav` - Site vertical navigation (mobile menu)
- `adminVerticalNav` - Admin panel sidebar navigation
- Both support narrow icon sidebar with hover tooltips

---

## CSS Units Strategy

| Use Case         | Unit      | Example                                      |
| ---------------- | --------- | -------------------------------------------- |
| Fixed Spacing    | `rem`     | `max-width: 62.5rem`                         |
| Fluid Typography | `clamp()` | `font-size: clamp(1rem, 1rem + 1vw, 1.5rem)` |
| Borders          | `px`      | `border: 1px solid`                          |
| Viewport Heights | `dvh`     | `height: 100dvh`                             |
| Line Height      | unitless  | `line-height: 1.5`                           |
| CSS Variables    | tokens    | `padding: var(--space-4)`                    |

---

## Translations

Two sources of truth:

| Type        | Source           | Editable by Client |
| ----------- | ---------------- | ------------------ |
| **SYSTEM**  | `i18n/system.ts` | ❌ Never           |
| **CONTENT** | Database         | ✅ Via Admin Panel |

**System translations** (developer-only):

- Prefixes: `common.*`, `nav.*`, `auth.*`, `admin.*`, `theme.*`, `footer.*`, `validation.*`
- Version controlled in git
- NOT visible in Admin Panel

**Content translations** (client-editable):

- Prefixes: `hero.*`, `about.*`, `portfolio.*`, `services.*`, `contact.*`, `seo.*`, `cta.*`
- Defaults in `i18n/content.ts` → seeded to database
- Client edits via Admin Panel

See `docs/USAGE.md` for full workflow.

---

## Config-Driven Philosophy

| Layer             | Defined By | Entered By       |
| ----------------- | ---------- | ---------------- |
| Structure/Schema  | Developer  | -                |
| Behavior/Features | Developer  | -                |
| Content/Values    | -          | Client via Admin |

The developer defines WHICH settings exist. The client enters VALUES.

---

## Git Commit Messages

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code change (no new feature, no bug fix)
- `style` - CSS/formatting changes (no logic change)
- `docs` - Documentation only
- `chore` - Build/config changes
- `perf` - Performance improvement

### Examples

```
feat(footer): add responsive grid layout
fix(i18n): add missing footer translation keys
refactor(css): clean up unused footer styles
style(footer): reduce spacing between legal bar and made-with
docs: add PM_BEST_PRACTICES.md
```

---

## File Organization

- Prefer organizing code into folders with separate files for each utility/type
- Don't consolidate everything into a single file
- Keep related code close together
- **CSS**: One file per component (e.g., `icons.css`, `tabs.css`, `admin-sidebar.css`)

---

## Application Modes

### 4 Application Modes

| Mode            | Website         | App                              |
| --------------- | --------------- | -------------------------------- |
| `app-only`      | ❌              | ✅ App mode                      |
| `website-app`   | ✅ Website mode | ✅ App mode (login visible)      |
| `website-admin` | ✅ Website mode | ✅ App mode (hidden at `/admin`) |
| `website-only`  | ✅ Website mode | ❌                               |

### Visual Modes

| Mode        | Desktop           | Mobile         |
| ----------- | ----------------- | -------------- |
| **Website** | Horizontal header | Hamburger menu |
| **App**     | Vertical sidebar  | Bottom nav bar |

**Key:** Admin panel IS app mode - not a separate thing.

### Website Sub-Modes

| Mode     | Navigation                                  |
| -------- | ------------------------------------------- |
| Onepager | Scroll-based anchors (`#about`, `#contact`) |
| SPA      | Route-based (`/about`, `/contact`)          |

---

## Code Review Mindset

When analyzing code, act like a senior dev:

- Flag redundancy as PROBLEMS
- Flag over-engineering as PROBLEMS
- Flag duplicate implementations as PROBLEMS
- Once a decision is made, document it and don't revisit as open discussion

---

## Backend Best Practices

### API Route Naming

```
server/api/
├── auth/
│   ├── login.post.ts      # POST /api/auth/login
│   ├── logout.post.ts     # POST /api/auth/logout
│   └── session.get.ts     # GET /api/auth/session
├── admin/
│   ├── portfolio/
│   │   ├── index.get.ts   # GET /api/admin/portfolio
│   │   ├── index.post.ts  # POST /api/admin/portfolio
│   │   └── [id].put.ts    # PUT /api/admin/portfolio/:id
│   └── settings.put.ts    # PUT /api/admin/settings
└── public/
    └── contact.post.ts    # POST /api/public/contact
```

**Conventions:**

- Use folders for resource grouping
- File suffix indicates HTTP method: `.get.ts`, `.post.ts`, `.put.ts`, `.delete.ts`
- `[id]` for dynamic parameters
- `admin/` prefix for protected routes
- `public/` prefix for unauthenticated routes

### Zod Validation Patterns

Always validate on server, never trust client:

```typescript
// server/api/admin/portfolio/index.post.ts
import { z } from 'zod'

const CreatePortfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  imageUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
  category: z.string().max(50).nullable(),
  published: z.boolean().default(false)
})

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const validated = CreatePortfolioSchema.parse(body)
  // ... create in database
})
```

### Database Transactions

Use transactions for multi-step operations:

```typescript
import { db } from '~/server/database/client'

await db.transaction(async tx => {
  await tx.insert(portfolioItems).values(item)
  await tx.update(settings).set({ lastUpdated: new Date() })
})
```

### Error Handling

Use `createError` for consistent API errors:

```typescript
// ❌ WRONG
throw new Error('Not found')

// ✅ CORRECT
throw createError({
  statusCode: 404,
  statusMessage: 'Portfolio item not found'
})
```

---

## Security Best Practices

### CSRF Protection

All state-changing requests (POST, PUT, DELETE) require CSRF token:

```typescript
// Client: Include token in requests
const { csrfToken } = useCsrf()

await $fetch('/api/admin/settings', {
  method: 'PUT',
  headers: { 'X-CSRF-Token': csrfToken.value },
  body: data
})
```

```typescript
// Server: Validate token in middleware
// server/middleware/csrf.ts - already implemented
```

### XSS Prevention

Always escape user content before rendering:

```typescript
import { escapeHtml } from '~/server/utils/sanitize'

// ❌ WRONG - Direct interpolation
const html = `<p>${userInput}</p>`

// ✅ CORRECT - Escape first
const html = `<p>${escapeHtml(userInput)}</p>`
```

In Vue templates, `{{ }}` auto-escapes. Use `v-html` only with sanitized content.

### Input Validation

| Location | Method                      | Purpose                           |
| -------- | --------------------------- | --------------------------------- |
| Client   | HTML5 `required`, `pattern` | UX feedback only                  |
| Server   | Zod schemas                 | **Security** - never trust client |

```typescript
// Always validate on server, even if client validated
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
```

### Authentication

```typescript
// Protect admin routes with middleware
// server/middleware/auth.ts

export default defineEventHandler(event => {
  const path = getRequestURL(event).pathname

  if (path.startsWith('/api/admin')) {
    const session = await getSession(event)
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }
})
```

### Secrets Management

| Secret               | Location | Never In          |
| -------------------- | -------- | ----------------- |
| Database credentials | `.env`   | Code, git         |
| API keys             | `.env`   | Code, git, client |
| Session secret       | `.env`   | Code, git         |

```bash
# .env (never commit)
SESSION_SECRET=your-secret-here
TELEGRAM_BOT_TOKEN=your-token

# .env.example (commit this)
SESSION_SECRET=
TELEGRAM_BOT_TOKEN=
```

---

## DevOps Best Practices

### Environment Variables

**Naming convention:**

```bash
# Service prefixes
DB_*          # Database
S3_*          # Storage
SMTP_*        # Email
TELEGRAM_*    # Notifications

# Examples
DB_PATH=./data/sqlite.db
S3_BUCKET=my-bucket
SMTP_HOST=smtp.example.com
TELEGRAM_BOT_TOKEN=123:ABC
```

### Docker

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.output .output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Kamal Deployment

```bash
# Deploy
npm run deploy        # kamal deploy

# Rollback
npm run rollback      # kamal rollback

# Logs
npm run logs          # kamal app logs

# Shell access
npm run shell         # kamal app exec -i bash
```

### Health Checks

```typescript
// server/api/health.get.ts
export default defineEventHandler(() => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}))
```

Configure in `deploy.yml`:

```yaml
healthcheck:
  path: /api/health
  interval: 10s
```

---

## UX Best Practices

### Loading States

Always show loading feedback:

```vue
<template>
  <button :disabled="isLoading" @click="save">
    <LoadingSpinner v-if="isLoading" />
    <span v-else>Save</span>
  </button>
</template>
```

Use skeleton loaders for content:

```vue
<LoadingCard v-if="isLoading" />
<PortfolioCard v-else :item="item" />
```

### Error Handling UX

```vue
<template>
  <!-- Show toast for transient errors -->
  <button @click="handleSave">Save</button>

  <!-- Show inline for form errors -->
  <input v-model="email" />
  <span v-if="errors.email" class="error">{{ errors.email }}</span>
</template>

<script setup>
async function handleSave() {
  try {
    await save()
    toast.success('Saved successfully')
  } catch (e) {
    toast.error('Failed to save. Please try again.')
  }
}
</script>
```

### Form Validation Feedback

| State             | Visual                     |
| ----------------- | -------------------------- |
| Pristine          | Normal border              |
| Invalid + touched | Red border + error message |
| Valid             | Green border (optional)    |
| Submitting        | Disabled + spinner         |

### Mobile Touch Targets

Minimum touch target: **44x44px**

```css
.button,
.nav-link,
.icon-button {
  min-height: 44px;
  min-width: 44px;
}
```

### Empty States

Always design for zero data:

```vue
<template>
  <div v-if="items.length === 0" class="empty-state">
    <IconInbox class="empty-state__icon" />
    <h3>No portfolio items yet</h3>
    <p>Add your first project to get started.</p>
    <button @click="openCreateModal">Add Project</button>
  </div>
  <PortfolioGrid v-else :items="items" />
</template>
```

### Confirmations

Use confirm dialogs for destructive actions:

```typescript
const { confirm } = useConfirm()

async function handleDelete(item) {
  const confirmed = await confirm(`Delete "${item.title}"? This cannot be undone.`, {
    variant: 'danger',
    confirmText: 'Delete'
  })
  if (confirmed) {
    await deleteItem(item.id)
  }
}
```

---

## State Management

### When to Use What

| State Type        | Solution     | Example                  |
| ----------------- | ------------ | ------------------------ |
| Component-local   | `ref()`      | Form inputs, open/closed |
| Shared simple     | `useState()` | Auth user, locale        |
| Complex/persisted | Pinia store  | Admin UI, portfolio CRUD |

### Pinia Store Pattern (Composition API)

```typescript
// stores/example.ts
import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref<Item[]>([])
  const isLoading = ref(false)

  // Getters (computed)
  const itemCount = computed(() => items.value.length)

  // Actions
  async function fetchItems() {
    isLoading.value = true
    try {
      items.value = await $fetch('/api/items')
    } finally {
      isLoading.value = false
    }
  }

  return { items, isLoading, itemCount, fetchItems }
})
```

---

## Types Organization

Central types in `app/types/`:

```
types/
├── index.ts      # Barrel export
├── auth.ts       # UserRole, User, LoginCredentials
├── toast.ts      # ToastType, Toast, ToastOptions
├── confirm.ts    # ConfirmOptions, ConfirmState
└── settings.ts   # SiteSettings
```

Import from central location:

```typescript
import type { User, SiteSettings } from '~/types'
```
