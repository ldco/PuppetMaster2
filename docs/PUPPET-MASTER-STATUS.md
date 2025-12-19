# 🎭 Puppet Master - Project Status Document

**Version:** 2.3
**Last Updated:** 2025-12-19
**Status:** PRODUCTION READY

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [What's Been Built](#3-whats-been-built)
4. [What's NOT Built Yet](#4-whats-not-built-yet)
5. [Known Issues](#5-known-issues)
6. [Documentation Status](#6-documentation-status)
7. [File Structure](#7-file-structure)
8. [Configuration Reference](#8-configuration-reference)
9. [CSS Architecture](#9-css-architecture)
10. [Component Inventory](#10-component-inventory)
11. [API Endpoints](#11-api-endpoints)
12. [Next Steps](#12-next-steps)

---

## 1. Project Overview

### What is Puppet Master?

A **config-driven studio toolkit/framework** for building client websites quickly and robustly. Pure CSS architecture (no Tailwind), with Nuxt 4 for full-stack capabilities.

> ### 🎯 MOTTO
> **"The config file is the developer's best friend!"**
>
> Developer defines **structure, schema, and behavior** in config.
> Client/Admin fills in **content and values** via Admin Panel.

### Primary Use Cases

| Type | Description |
|------|-------------|
| Landing Pages | Single-page marketing sites |
| Portfolio Sites | Multi-page with project galleries |
| Business Sites | Company sites with contact forms |
| Small Apps | Simple SaaS with admin panel |

### Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Framework | Nuxt 4.2.2 | ✅ Configured |
| Frontend | Vue 3.5 | ✅ Working |
| Backend | Nitro | ✅ Configured |
| Database | SQLite + Drizzle **OR** External API | ✅ Both supported |
| Styling | Pure CSS (OKLCH) | ✅ Implemented |
| Icons | unplugin-icons + Tabler | ✅ Working |
| i18n | @nuxtjs/i18n | ✅ Configured |
| Theme | @nuxtjs/color-mode | ✅ Working |
| Images | Sharp | ✅ Complete |
| External API | OAuth/JWT + Circuit Breaker | ✅ Production Ready |

---

## 2. Architecture Summary

### Application Modes

**Two Visual Modes:**
- **Website**: Traditional site UX (hamburger menu on mobile, can use onepager OR SPA)
- **App**: Application UX (bottom nav on mobile, vertical sidebar, always SPA)

**Important:** The website portion uses Website visual mode. The app/admin portion uses App visual mode.
These are separate experiences - admin is always app-style regardless of application mode.

```
┌─────────────────┬──────────────────────────┬───────────────────────────────┐
│ Mode            │ Website Portion          │ App/Admin Portion             │
├─────────────────┼──────────────────────────┼───────────────────────────────┤
│ app-only        │ ❌ None                  │ App (vertical sidebar, SPA)   │
│ website-app     │ Website (hamburger, can  │ App (vertical sidebar, SPA)   │
│                 │ onepager OR SPA)         │ Login button visible          │
│ website-admin   │ Website (hamburger, can  │ Admin (vertical sidebar, SPA) │
│                 │ onepager OR SPA)         │ Hidden admin at /admin        │
│ website-only    │ Website (hamburger, can  │ ❌ None                       │
│                 │ onepager OR SPA)         │                               │
└─────────────────┴──────────────────────────┴───────────────────────────────┘
```

**Current Mode:** `website-admin` (default)

### Folder Structure

```
app/
├── app/                      # Nuxt app directory
│   ├── assets/css/           # Pure CSS architecture
│   ├── components/           # Atomic design components
│   ├── composables/          # Vue composables
│   ├── layouts/              # Page layouts
│   ├── middleware/           # Route middleware
│   ├── pages/                # Route pages
│   ├── plugins/              # Nuxt plugins
│   ├── utils/                # Utility functions
│   └── puppet-master.config.ts  # Central configuration
├── i18n/                     # Internationalization (single loader for all locales)
├── public/                   # Static assets
│   └── logos/                # Logo variants
├── server/                   # Nitro server
│   ├── api/                  # API endpoints (empty)
│   ├── database/             # Drizzle schema (empty)
│   ├── middleware/           # Server middleware
│   └── utils/                # Server utilities
└── types/                    # TypeScript types (empty)
```

---

## 3. What's Been Built

### ✅ Core Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| Nuxt 4 Setup | ✅ Complete | Using app/ directory |
| Pure CSS Architecture | ✅ Complete | 7-layer system |
| CSS Variables | ✅ Complete | OKLCH color system |
| Responsive System | ✅ Complete | Width-based breakpoints |
| RTL Support | ✅ Complete | Auto-detected from locale |

### ✅ Configuration System

| Feature | Status | Location |
|---------|--------|----------|
| Central Config | ✅ Complete | `puppet-master.config.ts` |
| Application Modes | ✅ Complete | 4 modes supported |
| Feature Toggles | ✅ Complete | 6 toggles |
| useConfig Composable | ✅ Complete | Reactive access |
| Config-Driven Settings | ✅ Complete | Schema in config, values in Admin Panel |
| Settings Schema | ✅ Complete | `settings[]` with key, type, group, label, showIn |
| Setting Groups | ✅ Complete | `settingGroups[]` for admin UI organization |

### ✅ Layouts

| Layout | Status | Purpose |
|--------|--------|---------|
| `default.vue` | ✅ Complete | Website with header/footer |
| `admin.vue` | ✅ Complete | Admin panel layout |
| `blank.vue` | ✅ Complete | No chrome (login pages) |

### ✅ Components (Atomic Design)

#### Atoms (7 components)
| Component | Status | Features |
|-----------|--------|----------|
| `Logo.vue` | ✅ Complete | Theme/lang aware |
| `NavLink.vue` | ✅ Complete | Anchor + route support |
| `HamburgerIcon.vue` | ✅ Complete | Animated hamburger |
| `ThemeToggle.vue` | ✅ Complete | Light/dark switch |
| `LangSwitcher.vue` | ✅ Complete | Language dropdown |
| `CtaButton.vue` | ✅ Complete | Call-to-action |
| `SocialIcon.vue` | ✅ Complete | Social media icons |

#### Molecules (4 components)
| Component | Status | Features |
|-----------|--------|----------|
| `NavLinks.vue` | ✅ Complete | Nav items from config |
| `HeaderActions.vue` | ✅ Complete | Theme + Lang + Login |
| `SocialLinks.vue` | ✅ Complete | Social icons group |
| `LegalInfo.vue` | ✅ Complete | Copyright/legal |

#### Organisms (3 components)
| Component | Status | Features |
|-----------|--------|----------|
| `TheHeader.vue` | ✅ Complete | Interactive scroll header |
| `TheFooter.vue` | ✅ Complete | Footer with links |
| `MobileNav.vue` | ✅ Complete | Slide-out drawer |

#### Sections (5 components)
| Component | Status | Features |
|-----------|--------|----------|
| `SectionHero.vue` | ✅ Complete | Hero with CTA |
| `SectionAbout.vue` | ✅ Complete | About content |
| `SectionPortfolio.vue` | ✅ Complete | Portfolio grid |
| `SectionServices.vue` | ✅ Complete | Services list |
| `SectionContact.vue` | ✅ Complete | Contact form |

### ✅ Pages

| Page | Status | Purpose |
|------|--------|---------|
| `index.vue` | ✅ Complete | Main onepager |
| `login.vue` | ✅ Complete | Site-app login |
| `admin/login.vue` | ✅ Complete | Admin login |
| `admin/index.vue` | ✅ Complete | Admin dashboard |
| `admin/settings.vue` | ✅ Complete | Site settings editor |
| `admin/portfolio.vue` | ✅ Complete | Portfolio CRUD |
| `admin/contacts.vue` | ✅ Complete | Contact messages |

### ✅ Composables

| Composable | Status | Purpose |
|------------|--------|---------|
| `useConfig.ts` | ✅ Complete | Config access |
| `useLogo.ts` | ✅ Complete | Logo path resolution (headerLogo, shortLogo) |
| `useScrollHeader.ts` | ✅ Complete | Interactive header |
| `useMediaQuery.ts` | ✅ Complete | Responsive utilities |
| `useAuth.ts` | ✅ Complete | Authentication state & actions |
| `useSiteSettings.ts` | ✅ Complete | Runtime site settings from API |

### ✅ Middleware

| Middleware | Status | Purpose |
|------------|--------|---------|
| `app-mode.global.ts` | ✅ Complete | Mode-based routing |
| `auth.ts` | ✅ Complete | Admin route protection |

### ✅ Plugins

| Plugin | Status | Purpose |
|--------|--------|---------|
| `vh-fix.client.ts` | ✅ Complete | Mobile viewport fix |

### ✅ Logo System

| Variant | Status |
|---------|--------|
| `horizontal_dark_en.svg` | ✅ Available |
| `horizontal_dark_ru.svg` | ✅ Available |
| `horizontal_light_en.svg` | ✅ Available |
| `horizontal_light_ru.svg` | ✅ Available |
| `circle_dark_en.svg` | ✅ Available |
| `circle_dark_ru.svg` | ✅ Available |
| `circle_light_en.svg` | ✅ Available |
| `circle_light_ru.svg` | ✅ Available |

### ✅ i18n (Dynamic Architecture)

**New DX-friendly architecture - NO per-locale files needed!**

| File | Purpose |
|------|---------|
| `i18n/loader.ts` | Single dynamic loader for ALL locales |
| `i18n/fallbacks.ts` | Minimal bootstrap translations |
| `puppet-master.config.ts` | Locale definitions (code, iso, name) |

**How it works:**
1. Define locales in `puppet-master.config.ts` - no file creation needed
2. All locales use the same `loader.ts` file
3. Loader fetches translations from `/api/i18n/{locale}`
4. Falls back to `fallbacks.ts` if DB is empty
5. Manage all text via Admin Panel → Translations

| Language | Status | RTL |
|----------|--------|-----|
| English (en) | ✅ Complete | No |
| Russian (ru) | ✅ Complete | No |
| Hebrew (he) | ✅ Complete | Yes |

**Translation Keys Implemented:**
- `nav.*` - Navigation labels
- `common.*` - Common UI strings
- `theme.*` - Theme labels
- `footer.*` - Footer text
- `auth.*` - Authentication labels

---

## 4. What's NOT Built Yet

### ✅ Backend/API (COMPLETE)

| Component | Status | Priority |
|-----------|--------|----------|
| Database Schema | ✅ Complete | - |
| Drizzle Setup | ✅ Complete | - |
| Auth API | ✅ Complete | - |
| Settings API | ✅ Complete | - |
| Portfolio API (CRUD) | ✅ Complete | - |
| Upload API (Sharp) | ✅ Complete | - |
| Contact API | ✅ Complete | - |
| i18n API | ✅ Complete | - |

### ✅ Admin Panel (COMPLETE)

| Component | Status | Priority |
|-----------|--------|----------|
| Admin Layout | ✅ Complete | - |
| Icon Sidebar | ✅ Complete | - |
| Dashboard Page | ✅ Removed (redirects to settings) | - |
| Auth Middleware | ✅ Complete | - |
| Settings Page | ✅ Complete | - |
| Portfolio Page | ✅ Complete | - |
| Contacts Page | ✅ Complete | - |
| Translations Page | ✅ Complete | - |
| User Management | ✅ Complete | - |
| Unread Message Badge | ✅ Complete | - |
| Content Editor | ❌ Not started | MEDIUM |
| Media Library | ❌ Not started | MEDIUM |

### ✅ Authentication (COMPLETE)

| Feature | Status | Priority |
|---------|--------|----------|
| Login Logic | ✅ Complete | - |
| Session Management | ✅ Complete | - |
| useAuth Composable | ✅ Complete | - |
| Auth Middleware | ✅ Complete | - |
| Password Hashing (scrypt) | ✅ Complete | - |
| Password Reset | ❌ Not started | MEDIUM |
| Remember Me | ✅ Complete | - |

### ✅ Image Processing (COMPLETE)

| Feature | Status | Priority |
|---------|--------|----------|
| Sharp Integration | ✅ Complete | - |
| Thumbnail Generation | ✅ Complete | - |
| WebP Conversion | ✅ Complete | - |
| Lazy Loading | ❌ Not started | LOW |

### ✅ External API Integration (COMPLETE)

| Feature | Status | Priority |
|---------|--------|----------|
| API Client (Fetch-based) | ✅ Complete | - |
| OAuth 2.0 / JWT / API Key Auth | ✅ Complete | - |
| Token Auto-Refresh | ✅ Complete | - |
| Circuit Breaker Pattern | ✅ Complete | - |
| Exponential Backoff Retry | ✅ Complete | - |
| Response Caching (In-Memory) | ✅ Complete | - |
| Per-Resource TTL Configuration | ✅ Complete | - |
| Hybrid Mode (DB + API) | ✅ Complete | - |
| Memory Leak Prevention | ✅ Fixed | - |
| Redis Support | ❌ TODO Comments | LOW |
| Request Deduplication | ❌ Not started | LOW |
| GraphQL Support | ❌ Not started | LOW |

### ❌ SPA Mode

| Feature | Status | Priority |
|---------|--------|----------|
| Individual Pages | ❌ Not started | LOW |
| Route-based Nav | ✅ Logic ready | - |
| Page Transitions | ❌ Not started | LOW |

---

## 5. Known Issues

### 🔴 Critical Issues

| Issue | Description | Status |
|-------|-------------|--------|
| None | All critical issues resolved | ✅ |

### 🟡 Cosmetic Issues

| Issue | Description | Status |
|-------|-------------|--------|
| Section Alignment | Sections may not be perfectly centered | ⚠️ Needs verification |
| Mobile Lang Dropdown | Native select positioning | ⚠️ Partially fixed |

### 🟢 Fixed Issues (2024-12-17)

| Issue | Fix Applied |
|-------|-------------|
| TypeScript Errors (105) | Fixed all type errors - icons.d.ts, Zod v4 API, null checks |
| i18n Missing Keys | Fixed `getSystemTranslations()` to return nested objects |
| Hydration Mismatch (SectionAbout) | Changed `<p>` to `<div>` for slot container |
| Console Errors | All DevTools errors resolved |
| Scoped media queries | Moved to global CSS |
| Emoji icons | Replaced with Tabler icons |
| Header hiding | Changed to shrink-only |
| Color mode hydration | Removed class from app.vue |

### 🟢 Fixed Issues (2024-12-19) - CSS Refactor

| Issue | Fix Applied |
|-------|-------------|
| Admin sidebar showing on mobile | Fixed CSS cascade order, responsive rules now in same file as base styles |
| Missing `display: flex` in `.admin-sidebar` | Added base display property |
| Missing `display: flex` in `.admin-header` | Added base display property |
| Missing `margin-inline-start` in `.admin-main` | Added base margin property |
| Duplicate `.icon-lg` definitions | Consolidated to single `icons.css` file |
| Duplicate `.truncate` definitions | Consolidated to single `text.css` file |
| Duplicate `.form-hint` definitions | Consolidated to single `inputs.css` file |
| Debug `console.log` in translations.vue | Removed |
| Magic numbers in CSS | Replaced with CSS variables (e.g., `36px` → `var(--avatar-sm)`) |
| RTL `border-top` usage | Changed to `border-block-start` |

---

## 6. Documentation Status

### ✅ Documented

| Document | Location | Status |
|----------|----------|--------|
| Technical Brief | `PUPPET-MASTER-TECHNICAL-BRIEF.md` | ✅ Complete (2800+ lines) |
| This Status Doc | `PUPPET-MASTER-STATUS.md` | ✅ Complete |
| Config Comments | `puppet-master.config.ts` | ✅ Well documented |
| CSS DX Comments | Various CSS files | ✅ Inline docs |

### ❌ Not Documented

| Topic | Priority |
|-------|----------|
| API Documentation | HIGH |
| Component Props/Events | MEDIUM |
| Deployment Guide | MEDIUM |
| Customization Guide | LOW |
| Contributing Guide | LOW |

---

## 7. File Structure

### CSS Architecture (5 Layers - Post-Refactor 2024-12-19)

**Layer Order:** `@layer reset, primitives, semantic, components, utilities;`

```
assets/css/
├── main.css                    # Entry point, layer declarations
├── reset.css                   # CSS reset (layer: reset)
│
├── colors/                     # (layer: primitives)
│   ├── index.css
│   ├── primitives.css          # Base colors (--c-black, --c-white, --c-brand, --c-accent)
│   └── auto.css                # Auto-calculated (--l-bg, --l-text, light-dark())
│
├── typography/                 # (layer: primitives)
│   ├── index.css
│   ├── variables.css           # Font tokens (--font-xs to --font-4xl)
│   ├── base.css                # Base typography
│   └── fonts/                  # Font files
│
├── layout/                     # (layer: components)
│   ├── index.css
│   ├── page.css                # Page structure, CSS variables for breakpoints
│   ├── breakpoints.css         # Custom media queries (--phone, --tablet, --desktop)
│   ├── responsive.css          # Responsive utilities (layer: utilities)
│   ├── sections.css            # Full-height sections
│   ├── containers.css          # Max-width containers
│   ├── grid.css                # Grid system
│   ├── admin-sidebar.css       # Admin panel sidebar (with responsive rules)
│   ├── admin-content.css       # Admin panel main content area
│   └── admin-header.css        # Admin panel mobile header
│
├── skeleton/                   # (layer: components)
│   ├── index.css
│   ├── header.css              # Site header
│   ├── footer.css              # Site footer
│   ├── nav.css                 # Desktop navigation
│   ├── mobile-nav.css          # Mobile drawer navigation
│   ├── bottom-nav.css          # App-mode bottom navigation
│   └── social-nav.css          # Social icons navigation
│
├── common/                     # (layer: utilities)
│   ├── index.css
│   ├── utilities.css           # Display, visibility helpers
│   ├── spacing.css             # Spacing tokens (--space-1 to --space-32)
│   ├── flexbox.css             # Flex utilities (.flex, .items-center, .gap-*)
│   ├── grid.css                # Grid utilities (.grid-cols-*, .gap-*)
│   ├── sizing.css              # Width/height utilities
│   ├── icons.css               # Icon sizing (.icon-xs to .icon-2xl)
│   ├── text.css                # Text utilities (.truncate, .line-clamp-*)
│   ├── accessibility.css       # A11y helpers (.sr-only, .visually-hidden)
│   ├── effects.css             # Shadows, transitions, transforms
│   ├── scrollbars.css          # Custom scrollbar styles
│   └── edge-cases.css          # Browser-specific fixes
│
├── ui/                         # (layer: components)
│   ├── index.css
│   ├── hamburger.css           # Hamburger icon animation
│   ├── forms/
│   │   ├── index.css
│   │   ├── inputs.css          # Input fields, textareas
│   │   ├── buttons.css         # Button variants
│   │   └── search.css          # Search input component
│   ├── content/
│   │   ├── index.css
│   │   ├── cards.css           # Card components
│   │   ├── tabs.css            # Tab components (.tabs, .tabs--underline)
│   │   ├── badges.css          # Badge components
│   │   ├── avatars.css         # Avatar sizing (--avatar-sm to --avatar-xl)
│   │   ├── state-indicators.css # Loading states, empty states
│   │   ├── inbox.css           # Inbox/message list styles
│   │   ├── settings-form.css   # Settings form layout
│   │   └── portfolio-grid.css  # Portfolio grid layout
│   ├── layouts/
│   │   └── index.css
│   └── overlays/
│       ├── index.css
│       ├── modal.css           # Modal dialogs
│       ├── lightbox.css        # Image lightbox
│       ├── confirm.css         # Confirm dialogs
│       └── toast.css           # Toast notifications
│
└── animations/                 # (layer: components)
    ├── index.css
    ├── keyframes.css           # @keyframes definitions
    └── transitions.css         # Transition utilities
```

**Key Refactor Changes (2024-12-19):**
- Split `page.css` from 830 → 236 lines (72% reduction)
- Split `utilities.css` from 344 → 122 lines (65% reduction)
- Created 16 new modular CSS files
- Each component has its own file for easy client customization
- Admin layout styles now have dedicated files with responsive rules in same file

### Component Structure (Atomic Design)

```
components/
├── atoms/                # Smallest units
│   ├── Logo.vue
│   ├── NavLink.vue
│   ├── HamburgerIcon.vue
│   ├── ThemeToggle.vue
│   ├── LangSwitcher.vue
│   ├── CtaButton.vue
│   └── SocialIcon.vue
├── molecules/            # Atom combinations
│   ├── NavLinks.vue
│   ├── HeaderActions.vue
│   ├── SocialLinks.vue
│   └── LegalInfo.vue
├── organisms/            # Complex components
│   ├── TheHeader.vue
│   ├── TheFooter.vue
│   └── MobileNav.vue
├── sections/             # Page sections
│   ├── SectionHero.vue
│   ├── SectionAbout.vue
│   ├── SectionPortfolio.vue
│   ├── SectionServices.vue
│   └── SectionContact.vue
├── skeleton/             # (empty, for future)
└── templates/            # (empty, for future)
```

---

## 8. Configuration Reference

### puppet-master.config.ts

```typescript
{
  // Application mode
  mode: 'app-only' | 'website-app' | 'website-admin' | 'website-only',

  // Feature toggles
  features: {
    multiLangs: boolean,        // Multi-language support
    doubleTheme: boolean,       // Light/dark mode
    onepager: boolean,          // Website portion: Scroll vs route nav (ignored in app modes)
    interactiveHeader: boolean, // Header scroll effects
    hideHeaderOnScroll: boolean,// Hide header on scroll
    verticalNav: boolean,       // Website: Icon sidebar for main site
    appVerticalNav: boolean,    // App/Admin: Vertical sidebar (true) or horizontal nav (false)
  },

  // Sections (source of truth for nav)
  sections: [
    { id: string, inNav: boolean }
  ],

  // Locales
  locales: [
    { code: string, iso: string, name: string }
  ],
  defaultLocale: string,

  // Logo configuration
  logo: {
    basePath: string,
    shapes: { horizontal: string, circle: string },
    langFallback: { [lang]: fallbackLang },
    available: string[]
  },

  // Brand colors
  colors: {
    black: string,   // Dark text/bg
    white: string,   // Light text/bg
    brand: string,   // Primary brand
    accent: string   // Secondary accent
  },

  // Settings schema (config-driven)
  settings: [
    { key: 'site.name', type: 'string', group: 'site', label: 'Site Name', default: '...' },
    // ... more settings
  ],
  settingGroups: [
    { key: 'site', label: 'Site Settings', icon: 'settings' },
    // ... more groups
  ],

  // Computed helpers (getters)
  hasWebsite: boolean,      // mode !== 'app-only'
  hasAdmin: boolean,        // mode !== 'website-only'
  hasLoginButton: boolean,  // mode === 'website-app'
  isAppPrimary: boolean,    // app-only || website-app
  isWebsitePrimary: boolean,// website-admin || website-only
  isMultiLang: boolean,     // multiLangs && locales > 1
  hasThemeToggle: boolean,  // doubleTheme
  useOnepager: boolean,     // hasWebsite && onepager (website portion only)
  useInteractiveHeader: boolean // hasWebsite && interactiveHeader
}
```

---

## 9. CSS Architecture

> **📖 Full Documentation:** See `docs/styles/CSS_ARCHITECTURE.md` for comprehensive CSS system documentation.

### Layer Order (Cascade Priority)

```css
@layer reset, primitives, semantic, components, utilities;
```

| Layer | Purpose | Override Priority |
|-------|---------|-------------------|
| `reset` | CSS reset/normalize | Lowest |
| `primitives` | Raw values (colors, fonts) | ↓ |
| `semantic` | Calculated values (color-mix, light-dark) | ↓ |
| `components` | UI styling (skeleton, forms, overlays) | ↓ |
| `utilities` | Override helpers (.flex, .hidden) | Highest |

### CSS Modular Philosophy

**One file per component** - each CSS component has its own dedicated file:

| Component Type | CSS Location | Purpose |
|----------------|--------------|---------|
| Admin Sidebar | `layout/admin-sidebar.css` | Sidebar + responsive rules |
| Admin Header | `layout/admin-header.css` | Mobile header + responsive |
| Icons | `common/icons.css` | Icon sizing classes |
| Tabs | `ui/content/tabs.css` | Tab components |

This allows client customization by editing ONE file for each visual component.

### CSS Variables

#### Colors (primitives.css)
```css
:root {
  --c-black: oklch(from #2f2f2f l c h);
  --c-white: oklch(from #f0f0f0 l c h);
  --c-brand: oklch(from #aa0000 l c h);
  --c-accent: oklch(from #0f172a l c h);
}
```

#### Auto Colors (auto.css)
```css
:root {
  --l-bg: light-dark(var(--c-white), var(--c-black));
  --l-text: light-dark(var(--c-black), var(--c-white));
  --l-surface: color-mix(...);
  --l-border: color-mix(...);
  --l-text-muted: color-mix(...);
}
```

#### Spacing (spacing.css)
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-24: 6rem;    /* 96px */
  --space-32: 8rem;    /* 128px */
}
```

#### Typography (variables.css)
```css
:root {
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-lg: 1.125rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-3xl: 1.875rem;
  --font-4xl: 2.25rem;
}
```

### Breakpoints (responsive.css)
```css
/* Mobile first - min-width queries */
@media (width >= 640px)  { /* sm */ }
@media (width >= 768px)  { /* md */ }
@media (width >= 1024px) { /* lg */ }
@media (width >= 1280px) { /* xl */ }
```

---

## 10. Component Inventory

### Props Reference

#### Logo.vue
```typescript
defineProps<{
  shape?: 'horizontal' | 'circle'  // default: 'horizontal'
}>()
```

#### NavLink.vue
```typescript
defineProps<{
  to: string           // URL or anchor
  label?: string       // Link text
  isAnchor?: boolean   // Use <a> vs NuxtLink
}>()
```

#### HamburgerIcon.vue
```typescript
defineProps<{
  isActive?: boolean   // Open state
}>()
defineEmits<{
  toggle: []
}>()
```

---

## 11. API Endpoints

### Implemented Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/auth/login` | POST | User login | ✅ Complete |
| `/api/auth/logout` | POST | User logout | ✅ Complete |
| `/api/auth/me` | GET | Current user/session | ✅ Complete |
| `/api/settings` | GET | Get all site settings | ✅ Complete |
| `/api/settings` | PUT | Update site settings (admin) | ✅ Complete |
| `/api/portfolio` | GET | List portfolio items | ✅ Complete |
| `/api/portfolio` | POST | Create portfolio item (admin) | ✅ Complete |
| `/api/portfolio/[id]` | GET | Get single item | ✅ Complete |
| `/api/portfolio/[id]` | PUT | Update item (admin) | ✅ Complete |
| `/api/portfolio/[id]` | DELETE | Delete item (admin) | ✅ Complete |
| `/api/upload/image` | POST | Upload image with Sharp | ✅ Complete |
| `/api/contact/submit` | POST | Submit contact form | ✅ Complete |
| `/api/admin/contacts` | GET | List contact submissions | ✅ Complete |
| `/api/admin/contacts/[id]` | PUT | Mark read/unread | ✅ Complete |
| `/api/admin/contacts/[id]` | DELETE | Delete submission | ✅ Complete |
| `/api/admin/stats` | GET | Dashboard statistics | ✅ Complete |

### i18n Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/i18n/[locale]` | GET | Get translations for locale | ✅ Complete |
| `/api/admin/translations` | GET | List all translations | ✅ Complete |
| `/api/admin/translations` | POST | Create/update translation | ✅ Complete |
| `/api/admin/translations/[id]` | DELETE | Delete translation | ✅ Complete |

---

## 12. Next Steps

### ✅ Completed

1. **Core Infrastructure** - ✅ Complete
2. **CSS Architecture** - ✅ Complete
3. **Components (Atomic Design)** - ✅ Complete
4. **Authentication** - ✅ Complete
5. **Database & APIs** - ✅ Complete
6. **Admin Panel Pages** - ✅ Complete
7. **Image Processing** - ✅ Complete
8. **User Management (RBAC)** - ✅ Complete (Master/Admin/Editor roles)
9. **Testing Framework** - ✅ Complete (Vitest, 88 tests passing)
10. **Code Cleanup** - ✅ Complete (105 TS errors fixed, DevTools errors fixed)
11. **CSS Modular Refactor** - ✅ Complete (2024-12-19)
    - 16 new modular CSS files
    - page.css: 830 → 236 lines (72% reduction)
    - utilities.css: 344 → 122 lines (65% reduction)
    - All responsive rules in same file as base styles
    - All magic numbers replaced with CSS variables
12. **External API Integration** - ✅ Complete (2025-12-19)
    - Full REST API client with OAuth 2.0/JWT auth
    - Circuit breaker + retry logic for resilience
    - Intelligent caching with per-resource TTL
    - 3 provider modes: database, api, hybrid
    - Production-ready with memory leak fixes
    - Comprehensive documentation in docs/EXTERNAL_API.md

### Immediate Priority (This Week)

1. **Test All Application Modes**
   - Test `app-only` mode
   - Test `website-app` mode
   - Test `website-admin` mode
   - Test `website-only` mode

### Short Term (Next 2 Weeks)

2. **Content Management Enhancements**
   - Rich text editor for portfolio descriptions
   - Media library for managing uploads

3. **Additional Features**
   - Password reset flow
   - Lazy loading for images
   - Health Monitoring Page (Master Only)
   - Analytics/Statistics Page

### Before Launch

4. **Testing**
   - E2E tests
   - Lighthouse audit ✅ (Desktop 99, Mobile 73, Accessibility/SEO/BP all 100)

### Performance Optimization Ideas (Consider Later)

- **Nuxt Islands** - Partial hydration to reduce unused JS (mobile perf)
- **nuxt-delay-hydration** - Delay non-critical hydration

5. **Deployment**
   - Kamal setup
   - CI/CD pipeline
   - Monitoring

---

## Appendix: Quick Commands

```bash
# Development
cd app && npm run dev

# Build
cd app && npm run build

# Preview production
cd app && npm run preview

# Generate static
cd app && npm run generate
```

---

## Appendix A: Installed Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `nuxt` | ^4.2.2 | Framework |
| `vue` | ^3.5.25 | Frontend |
| `vue-router` | ^4.6.3 | Routing |
| `pinia` | ^3.0.4 | State management |
| `@pinia/nuxt` | ^0.11.3 | Pinia integration |
| `@nuxtjs/color-mode` | ^4.0.0 | Theme switching |
| `@nuxtjs/i18n` | ^10.2.1 | Internationalization |
| `better-sqlite3` | ^12.5.0 | SQLite database |
| `drizzle-orm` | ^0.45.1 | ORM |
| `sharp` | ^0.34.5 | Image processing |
| `unplugin-icons` | ^22.5.0 | Icon loading |
| `vite-svg-loader` | ^5.1.0 | SVG as components |
| `hamburgers` | ^1.2.1 | Hamburger animations |
| `zod` | ^4.1.13 | Schema validation |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@iconify/json` | ^2.2.418 | Icon collections |
| `@types/better-sqlite3` | ^7.6.13 | TypeScript types |
| `drizzle-kit` | ^0.31.8 | Database migrations |

---

## Appendix B: Composable API Reference

### useConfig()

```typescript
const {
  // Mode
  mode,                    // 'app-only' | 'website-app' | 'website-admin' | 'website-only'
  hasWebsite,              // boolean - has website portion
  hasAdmin,                // boolean - has admin/app portion
  hasLoginButton,          // boolean - mode === 'website-app'
  isAppPrimary,            // boolean - app-only || website-app
  isWebsitePrimary,        // boolean - website-admin || website-only

  // Features
  features,                // Full features object
  isMultiLang,             // boolean
  hasThemeToggle,          // boolean
  isOnepager,              // boolean - website portion only
  hasInteractiveHeader,    // boolean
  hideHeaderOnScroll,      // boolean
  appVerticalNav,          // boolean - app/admin vertical sidebar

  // Data
  locales,                 // Locale[]
  defaultLocale,           // string
  sections,                // Section[]
  colors,                  // Colors object
  logo,                    // Logo config
  config                   // Full config access
} = useConfig()
```

### useLogo()

```typescript
const {
  headerLogo,              // ComputedRef<string> - Full horizontal logo
  shortLogo,               // ComputedRef<string> - Compact circle logo (sidebar, footer)
  getLogoSrc,              // (shape) => string - Get logo path by shape
  hasVariant,              // (shape, theme, lang) => boolean - Check if variant exists
} = useLogo()
```

### useScrollHeader()

```typescript
const {
  headerClasses,           // ComputedRef<Record<string, boolean>>
  isScrolled,              // Ref<boolean>
  isHidden,                // Ref<boolean>
  scrollY,                 // Ref<number>
  scrollDirection,         // Ref<'up' | 'down' | null>
} = useScrollHeader(options?: {
  threshold?: number,      // default: 50
  hideOnScroll?: boolean,  // default: false
  scrollDelta?: number,    // default: 10
  enabled?: boolean        // default: from config
})
```

### useMediaQuery()

```typescript
const {
  isMobile,                // ComputedRef<boolean> - width < 768px
  isTablet,                // ComputedRef<boolean> - width >= 768 && < 1024
  isDesktop,               // ComputedRef<boolean> - width >= 1024
  matches,                 // (query: string) => ComputedRef<boolean>
} = useMediaQuery()
```

---

## Appendix C: CSS Class Reference

### Layout Classes

| Class | Purpose |
|-------|---------|
| `.page` | Main page wrapper |
| `.section` | Full-height section |
| `.section-hero` | Hero with extra top padding |
| `.container` | Max-width container |
| `.container-narrow` | Narrower container |
| `.container-wide` | Wider container |

### Grid Classes

| Class | Purpose |
|-------|---------|
| `.grid` | CSS Grid container |
| `.grid-cols-2` | 2 column grid |
| `.grid-cols-3` | 3 column grid |
| `.grid-cols-4` | 4 column grid |
| `.gap-4` | Gap of var(--space-4) |

### Skeleton Classes

| Class | Purpose |
|-------|---------|
| `.header` | Main header |
| `.header--scrolled` | Scrolled state |
| `.header--hidden` | Hidden state |
| `.footer` | Main footer |
| `.mobile-nav` | Mobile navigation drawer |
| `.mobile-nav-backdrop` | Overlay behind drawer |

### Typography Classes

| Class | Purpose |
|-------|---------|
| `.text-xs` through `.text-4xl` | Font sizes |
| `.font-bold` | Bold weight |
| `.text-center` | Center alignment |
| `.text-muted` | Muted color |

### Utility Classes

| Class | Purpose |
|-------|---------|
| `.sr-only` | Screen reader only |
| `.visually-hidden` | Hidden visually |
| `.flex` | Display flex |
| `.hidden` | Display none |

---

## Appendix D: Translation Keys

### nav.*
```json
{
  "home": "Home",
  "about": "About",
  "portfolio": "Portfolio",
  "services": "Services",
  "contact": "Contact",
  "openMenu": "Open menu",
  "closeMenu": "Close menu"
}
```

### common.*
```json
{
  "menu": "Menu",
  "close": "Close",
  "submit": "Submit",
  "cancel": "Cancel",
  "save": "Save",
  "delete": "Delete",
  "edit": "Edit",
  "loading": "Loading...",
  "error": "Something went wrong",
  "success": "Success",
  "theme": "Theme",
  "language": "Language"
}
```

### theme.*
```json
{
  "light": "Light",
  "dark": "Dark",
  "system": "System"
}
```

### auth.*
```json
{
  "login": "Login",
  "logout": "Logout",
  "register": "Register",
  "email": "Email",
  "password": "Password",
  "forgotPassword": "Forgot password?",
  "rememberMe": "Remember me"
}
```

### footer.*
```json
{
  "rights": "All rights reserved"
}
```

---

## Appendix E: Design Tokens

### Colors (from logo)

| Token | Hex | Usage |
|-------|-----|-------|
| Black | `#2f2f2f` | Dark backgrounds, text |
| White | `#f0f0f0` | Light backgrounds, text |
| Brand | `#aa0000` | Primary accent (dark red) |
| Accent | `#0f172a` | Secondary (deep slate) |

### Spacing Scale

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |

### Border Radius

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--radius-xs` | 0.25rem | 4px | Subtle rounding (code blocks) |
| `--radius-sm` | 0.375rem | 6px | Buttons, inputs, tooltips |
| `--radius-md` | 0.5rem | 8px | Cards, modals, medium elements |
| `--radius-lg` | 0.75rem | 12px | Large cards, containers |
| `--radius-xl` | 1rem | 16px | Hero sections, large surfaces |
| `--radius-full` | 9999px | - | Pills, avatars, circles |

### Shadows

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Medium elevation |
| `--shadow-lg` | High elevation |

---

## Appendix F: Browser Support

### Target Browsers

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 100+ | Full support |
| Firefox | 100+ | Full support |
| Safari | 15.4+ | OKLCH support |
| Edge | 100+ | Full support |
| iOS Safari | 15.4+ | Full support |
| Android Chrome | 100+ | Full support |

### CSS Features Used

| Feature | Support |
|---------|---------|
| CSS Layers (`@layer`) | Modern browsers |
| OKLCH Colors | Chrome 111+, Safari 15.4+ |
| `color-mix()` | Chrome 111+, Safari 16.2+ |
| `light-dark()` | Chrome 123+, Safari 17.4+ |
| Container Queries | Chrome 105+, Safari 16+ |
| Logical Properties | All modern |

---

*This document should be updated as the project progresses.*

