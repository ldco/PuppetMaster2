# Puppet Master Architecture

## Two-Level Architecture

Puppet Master has TWO separate architectural levels that must not be confused:

### Level 1: System Entities (What Exists)

Two configurable entities + one management layer:

| Entity | Purpose | Who Uses It | Config |
|--------|---------|-------------|--------|
| **Website** | Public marketing, landing pages, info | Visitors (unauthenticated) | `entities.website` |
| **App** | User-facing features (dashboard, tracker, etc.) | Authenticated users | `entities.app` |
| **Admin** | Management layer for Website AND/OR App | Editors, Admins, Masters | `admin.enabled` |

**Key Insight:** Admin is NOT a separate entity — it's a management layer that SERVES the other entities.

### Level 2: UX Paradigms (How Things Look)

Two fundamental UX paradigms:

```
┌─────────────────────────────────────────────────────────────────┐
│                      UX PARADIGMS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │    WEBSITE UX       │    │           APP UX                │ │
│  │                     │    │                                 │ │
│  │ • Horizontal header │    │ • Sidebar (desktop)             │ │
│  │ • Hamburger menu    │    │ • Bottom nav (mobile)           │ │
│  │ • Page-based nav    │    │ • Dashboard-like                │ │
│  │                     │    │ • Feature-based nav             │ │
│  │ Used by:            │    │                                 │ │
│  │ └── Website entity  │    │ Used by BOTH:                   │ │
│  │                     │    │ ├── App entity (user features)  │ │
│  │                     │    │ └── Admin (management sections) │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
│                                                                  │
│  CRITICAL: Admin uses APP UX — it's not a third paradigm!       │
│            The navigation CONTENT differs by role, not layout.  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Modular Entity Configuration

Instead of fixed modes, PM uses modular entity configuration:

### Entity Configuration

```typescript
entities: {
  website: boolean,  // Public marketing pages
  app: boolean,      // User-facing features
}
```

### Derived Behavior

| website | app | Behavior |
|---------|-----|----------|
| `false` | `true` | App-only: `/` redirects to `/login` |
| `true` | `true` | Website + App: public site + user app |
| `true` | `false` | Website-only: public site, admin hidden |

**Admin is always available when `admin.enabled: true`** — accessed at `/admin` (hidden route).

---

## Admin Module System

Admin consists of THREE categories of modules:

### 1. System Modules (PM Provides, Universal)

Every PM project needs these for management:

| Module | Purpose | Default Roles |
|--------|---------|---------------|
| `users` | User management | master, admin |
| `roles` | Role assignment | **master only** (hardcoded) |
| `translations` | i18n management | master, admin, editor |
| `settings` | App settings | master, admin |
| `health` | System health monitoring | master |
| `logs` | Activity/error logs | master |

### 2. Website Content Modules (PM Provides, Configurable)

PM provides these for website content management:

| Module | Purpose | Default Roles |
|--------|---------|---------------|
| `sections` | Hero, About, Contact sections | master, admin, editor |
| `blog` | Posts, categories, tags | master, admin, editor |
| `portfolio` | Projects, case studies | master, admin |
| `team` | Team member profiles | master, admin |
| `testimonials` | Customer reviews | master, admin, editor |
| `faq` | FAQ items | master, admin, editor |
| `clients` | Client/partner logos | master, admin |
| `pricing` | Pricing tiers | master, admin |

### 3. App Data Modules (Developer Builds, Custom)

Each app is unique — developer creates custom admin pages:

- Health tracker → custom admin for exercises, measurements
- E-commerce → custom admin for products, orders
- CRM → custom admin for contacts, deals

**PM provides the shell, developer builds the content.**

### Configuration Structure

```typescript
admin: {
  enabled: true,

  // 1. SYSTEM - Universal, PM provides
  system: {
    users: { enabled: true, roles: ['master', 'admin'] },
    roles: { enabled: true, roles: ['master'] },  // ALWAYS master-only
    translations: { enabled: true, roles: ['master', 'admin', 'editor'] },
    settings: { enabled: true, roles: ['master', 'admin'] },
    health: { enabled: true, roles: ['master'] },
    logs: { enabled: false, roles: ['master'] },
  },

  // 2. WEBSITE CONTENT - PM provides, per-project config
  websiteModules: {
    sections: { enabled: true, roles: ['master', 'admin', 'editor'] },
    blog: { enabled: false, roles: ['master', 'admin', 'editor'] },
    portfolio: { enabled: false, roles: ['master', 'admin'] },
    team: { enabled: false, roles: ['master', 'admin'] },
    testimonials: { enabled: false, roles: ['master', 'admin', 'editor'] },
    faq: { enabled: false, roles: ['master', 'admin', 'editor'] },
    clients: { enabled: false, roles: ['master', 'admin'] },
    pricing: { enabled: false, roles: ['master', 'admin'] },
  },

  // 3. APP DATA - Developer builds custom
  appModules: {
    // Defined per project
  },
}
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
master ─────┬───────────────────────────────────────────────────────────────┐
            │                                                               │
            ▼                                                               │
admin ──────┬─────────────────────────────────────────┐                     │
            │                                         │                     │
            ▼                                         │                     │
editor ─────┬───────────────────┐                     │                     │
            │                   │                     │                     │
            ▼                   ▼                     ▼                     ▼
user ───────────────────────────────────────────────────────────────────────┘

Permissions flow DOWN: master has all permissions, user has least
```

### Role Definitions

| Role | Purpose | Typical Access |
|------|---------|----------------|
| **master** | Developer/owner | Full system access, role assignment |
| **admin** | Client/manager | Content management, user management |
| **editor** | Employee/contributor | Content editing only |
| **user** | End user | App features only, no admin |

### Key RBAC Rules

1. **Role assignment is master-only** — not configurable, hardcoded for security
2. **Each module has configurable roles** — master defines who can access what
3. **Role hierarchy applies** — admin inherits editor permissions automatically
4. **Per-model role configuration** — granular control over each admin section

### Role Check Logic

```typescript
const ROLE_HIERARCHY = {
  master: ['admin', 'editor', 'user'],
  admin: ['editor', 'user'],
  editor: ['user'],
  user: [],
}

function canAccess(userRole: string, requiredRoles: string[]): boolean {
  const effectiveRoles = [userRole, ...ROLE_HIERARCHY[userRole]]
  return requiredRoles.some(r => effectiveRoles.includes(r))
}

// Examples:
// canAccess('admin', ['master', 'admin']) → true (admin is in list)
// canAccess('admin', ['editor']) → true (admin inherits editor)
// canAccess('editor', ['admin']) → false (editor doesn't have admin)
```

---

## Layout System

### Layouts (Visual Style)

| Layout | UX Paradigm | Visual Style | Use Case |
|--------|-------------|--------------|----------|
| `website` | Website UX | Horizontal header | Public pages |
| `app-sidebar` | App UX | Vertical sidebar | Admin, feature-rich apps |
| `app-minimal` | App UX | Minimal header | Simple apps, dashboards |
| `blank` | None | No chrome | Login, error pages |

### Layout vs Role (Critical Distinction)

**Layouts define WHERE navigation goes:**
- `app-sidebar`: Sidebar (desktop) + bottom nav (mobile)
- `app-minimal`: Horizontal header, minimal items
- `website`: Horizontal header with hamburger

**Roles define WHAT navigation shows:**
- User role → user sections only
- Admin role → user + content sections
- Master role → everything including system

**The navigation CONTENT is role-based, the LAYOUT is not!**

---

## Admin Navigation Structure

Admin sidebar organizes modules into groups:

```
┌─────────────────────────────┐
│  ADMIN SIDEBAR              │
├─────────────────────────────┤
│                             │
│  ⚙️ SYSTEM                  │  ← master/admin sees
│  ├── Users                  │
│  ├── Roles (master only)    │
│  ├── Translations           │
│  ├── Settings               │
│  ├── Health (master only)   │
│  └── Logs (master only)     │
│                             │
│  📄 CONTENT                 │  ← admin/editor sees
│  ├── Sections               │
│  ├── Blog                   │
│  ├── Portfolio              │
│  └── ...                    │
│                             │
│  📊 APP DATA                │  ← custom per project
│  ├── [Custom Module 1]      │
│  └── [Custom Module 2]      │
│                             │
└─────────────────────────────┘
```

**Rules:**
- Empty groups are hidden (not shown disabled)
- Disabled modules are hidden (not shown disabled)
- Master-only items show indicator badge
- Groups reorder based on user focus

---

## Route Structure

### With Website + App

```
/                   → Public website (Website UX)
/about, /blog, ...  → Website sections
/login              → User login
/app/*              → User app features (App UX)
/admin              → Admin dashboard (App UX, sidebar)
/admin/*            → Admin modules
```

### App Only (no website)

```
/                   → Redirects to /login
/login              → User login
/app/*              → User app features (App UX)
/admin/*            → Admin modules (App UX, sidebar)
```

### Website Only (no app)

```
/                   → Public website (Website UX)
/about, /blog, ...  → Website sections
/admin              → Admin (hidden route, App UX)
/admin/*            → Content management only
```

---

## Design Principles

1. **Modular over modal:**
   - Entities and modules are toggleable, not fixed modes
   - Admin is optional, not a separate "mode"

2. **Per-model permissions:**
   - Each module has its own role requirements
   - Master configures who can access what
   - Role assignment itself is always master-only

3. **Two UX paradigms only:**
   - Website UX for public pages
   - App UX for ALL authenticated experiences

4. **Role hierarchy:**
   - Higher roles inherit lower role permissions
   - No need to repeat permissions

5. **Clean navigation:**
   - Hide what user can't access (not disable)
   - Group related modules
   - Show role indicators where helpful

---

## Migration from Fixed Modes

If you have old config with `mode`:

| Old Mode | New Config |
|----------|------------|
| `app-only` | `entities: { website: false, app: true }` |
| `website-app` | `entities: { website: true, app: true }` |
| `website-admin` | `entities: { website: true, app: false }` |
| `website-only` | `entities: { website: true, app: false }, admin: { enabled: false }` |

---

*Architecture redesigned 2026-01-09 after Health Monitor migration revealed need for modular approach.*
