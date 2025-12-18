# 🎭 Puppet Master - Technical Brief

**Version:** 2.1
**Date:** 2024-12-17
**Status:** IN DEVELOPMENT

---

## Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Core Layer Specification](#5-core-layer-specification)
6. [Project Layer Specification](#6-project-layer-specification) - **Q15 Sections Strategy**
7. [Database Schema](#7-database-schema)
8. [CSS Architecture](#8-css-architecture) - **Q22 OKLCH Color System**
   - 8.1 [Icons & SVG Graphics](#81-icons--svg-graphics-q23-decision) - Q23
   - 8.2 [Forms & Validation](#82-forms--validation-q24-decision) - Q24
   - 8.3 [State Management](#83-state-management-q25-decision) - Q25
   - 8.4 [Animation System](#84-animation-system-q26-q30-decision) - Q26, Q30
   - 8.5 [Edge Cases](#85-edge-cases--browser-fixes-q27-decision) - Q27
   - 8.6 [CSS vs Component Organization](#86-css-vs-component-organization-critical-clarification) - **Critical Clarification**
   - 8.7 [CSS Layer Architecture](#87-css-layer-architecture-q34-decision) - **Q34 3-Layer System**
   - 8.8 [Layout System](#88-layout-system-q31-decision) - Q31
   - 8.9 [Interactive Header & Mobile UX](#89-interactive-header--mobile-ux) - **2025 Best Practices**
   - 8.10 [Vue Performance](#810-vue-3-performance-best-practices-q28-decision) - Q28
9. [Configuration System](#9-configuration-system) - Q20
10. [Feature Toggles](#10-feature-toggles)
11. [Authentication](#11-authentication)
12. [Internationalization](#12-internationalization)
13. [Image Processing](#13-image-processing-q16-decision) - Q16
14. [Deployment](#14-deployment-q17--q21-decision) - **Q21 Kamal**
15. [System/Browser Detection](#15-systembrowser-detection-q19-decision) - Q19
16. [Decisions Log](#16-decisions-log) - **All 34 Decisions**
   - 16.1 [DX Quick Reference](#161-dx-quick-reference---common-customizations) - **Common Customizations**
17. [Implementation Checklist](#17-implementation-checklist)
18. [File Templates](#18-file-templates)
19. [Component Architecture](#19-component-architecture-atomic-design) - Atomic Design
20. [Logo System](#20-logo-system) - Theme/Language variants

---

## 1. Vision & Goals

### What is Puppet Master?

A **config-driven studio toolkit/framework** for building client websites quickly and robustly.

> ### 🎯 MOTTO
> **"The config file is the developer's best friend!"**
>
> Puppet Master is a **config-driven framework**. The developer defines the structure,
> schema, and behavior in `puppet-master.config.ts`. The client/admin fills in the
> actual content via the Admin Panel. This separation is fundamental to the architecture.

### The Config-Driven Philosophy

| Layer | Defined By | Entered By | Where |
|-------|------------|------------|-------|
| **Structure** | Developer | - | `puppet-master.config.ts` |
| **Schema** | Developer | - | `puppet-master.config.ts` |
| **Behavior** | Developer | - | `puppet-master.config.ts` |
| **Content** | - | Client/Admin | Admin Panel → Database |
| **Values** | - | Client/Admin | Admin Panel → Database |

**Examples:**
- **Settings**: Developer defines which settings exist (`site.name`, `contact.phone`, etc.) and where they appear on the website. Client enters the actual values.
- **Sections**: Developer defines which sections exist and their order. Client enters section content.
- **Portfolio**: Developer enables portfolio feature. Client adds portfolio items.
- **Translations**: Developer defines supported locales. Client/translator enters translations.

### Primary Use Cases

| Type | Description |
|------|-------------|
| **Landing Pages** | Single-page marketing sites |
| **Portfolio Sites** | Multi-page with project galleries |
| **Business Sites** | Company sites with contact forms |
| **Small Apps** | Simple SaaS with admin panel |

### Core Principles

1. **Simple over Complex** - No over-engineering
2. **Fast Development** - Copy core, customize project
3. **Stable & Secure** - Battle-tested components
4. **Client-Friendly** - Easy admin panel for content
5. **Developer-Friendly** - Clear separation, good DX

### Key Requirements

| Requirement | Solution |
|-------------|----------|
| Build sites fast | Reusable core layer |
| Client edits content | Admin panel + CMS |
| Works without backend | SQLite (single file) |
| SEO-friendly | SSR/SSG with Nuxt |
| Mobile-first | Responsive CSS |
| Multi-language | i18n built-in |
| RTL support | CSS logical properties |
| Theme switching | Light/dark mode |
| One-pager mode | Scroll-based navigation |
| SPA mode | Route-based navigation |

---

## 2. Tech Stack

### Core Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Nuxt 3 | Full-stack, SSR/SSG, great DX |
| **Frontend** | Vue 3 | Composition API, reactive |
| **Backend** | Nitro | Built into Nuxt, fast |
| **Database** | SQLite | Simple, fast, file-based |
| **ORM** | Drizzle | Type-safe, lightweight |
| **Styling** | CSS (no framework) | Full control, no bloat |
| **Images** | Sharp | Fast processing in Node |

### No Python Backend

**Decision:** Drop Python backend entirely.

**Rationale:**
- Nuxt Nitro handles all backend needs
- SQLite handles all database needs
- Sharp handles all image processing
- One codebase, one language, one deploy
- Simpler development and deployment

### Dependencies

```json
{
  "dependencies": {
    "nuxt": "^3.x",
    "drizzle-orm": "^0.x",
    "better-sqlite3": "^9.x",
    "sharp": "^0.33.x",
    "@nuxtjs/i18n": "^8.x",
    "@nuxtjs/color-mode": "^3.x",
    "@pinia/nuxt": "^0.x",
    "pinia": "^2.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "drizzle-kit": "^0.x",
    "typescript": "^5.x",
    "unplugin-icons": "^0.x",
    "@iconify-json/tabler": "^1.x",
    "vite-svg-loader": "^5.x"
  }
}
```

---

## 3. Architecture

### Nuxt Layers Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  ROOT (app/frontend/)                                       │
│  └── nuxt.config.ts: extends: ['./core']                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CORE LAYER (./core/)                                 │  │
│  │  Reusable across ALL projects                         │  │
│  │                                                       │  │
│  │  • Skeleton (Header, Footer, Nav)                     │  │
│  │  • Layouts (default, admin)                           │  │
│  │  • Auth system                                        │  │
│  │  • Database setup (Drizzle + SQLite)                  │  │
│  │  • API routes (CRUD, auth, upload)                    │  │
│  │  • Core CSS (reset, colors, tokens, animations,       │  │
│  │              edge-cases, forms, skeleton, utilities)  │  │
│  │  • Composables (useConfig, useAuth, etc.)             │  │
│  │  • Plugins (security, CSRF)                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PROJECT LAYER (root level)                           │  │
│  │  Specific to THIS client project                      │  │
│  │                                                       │  │
│  │  • Sections (HeroSection, AboutSection, etc.) - Q15   │  │
│  │  • Project config (site name, colors, features)       │  │
│  │  • Project CSS (override base colors in colors.css)   │  │
│  │  • Public assets (images, favicon)                    │  │
│  │  • Single index.vue (renders sections)                │  │
│  └───────────────────────────────────────────────────────┘  │


---

## 4. Folder Structure

```
app/frontend/
├── nuxt.config.ts              # extends: ['./core']
├── app.vue                     # Root component
├── puppet-master.config.ts     # Project configuration
│
├── core/                       # ══════ CORE LAYER ══════
│   ├── nuxt.config.ts          # Core layer config
│   │
│   ├── components/
│   │   ├── atoms/              # Smallest reusable pieces
│   │   │   ├── Logo.vue        # Universal logo
│   │   │   ├── NavLink.vue     # Single nav link
│   │   │   ├── ThemeToggle.vue # Light/dark toggle
│   │   │   ├── LangSwitcher.vue# Language switcher
│   │   │   ├── HamburgerIcon.vue# Hamburger button
│   │   │   ├── CtaButton.vue   # CTA button
│   │   │   └── SocialIcon.vue  # Social link icon
│   │   │
│   │   ├── molecules/          # Composed atoms
│   │   │   ├── NavLinks.vue    # List of NavLink
│   │   │   ├── SocialLinks.vue # List of SocialIcon
│   │   │   ├── HeaderActions.vue# Theme + Lang + Contacts
│   │   │   └── LegalInfo.vue   # OOO, INN, OGRN
│   │   │
│   │   ├── organisms/          # Complete sections
│   │   │   ├── DesktopHeader.vue# Full desktop header
│   │   │   ├── MobileHeader.vue # Mobile header bar
│   │   │   ├── MobileNav.vue   # Slide-out mobile nav
│   │   │   ├── TheFooter.vue   # Complete footer
│   │   │   ├── AdminSidebar.vue# Admin sidebar
│   │   │   └── AdminHeader.vue # Admin top bar
│   │   │
│   │   └── templates/          # Smart switchers
│   │       └── TheHeader.vue   # Desktop OR Mobile
│   │
│   ├── composables/
│   │   ├── useConfig.ts        # Feature config access
│   │   ├── useAuth.ts          # Auth state
│   │   ├── useSiteSettings.ts  # CMS content
│   │   ├── useMediaQuery.ts    # Reactive CSS media query
│   │   └── useDevice.ts        # Device detection
│   │
│   ├── layouts/
│   │   ├── default.vue         # Main layout (header/footer)
│   │   ├── admin.vue           # Admin layout (sidebar)
│   │   └── blank.vue           # No chrome
│   │
│   ├── plugins/
│   │   ├── auth.client.ts      # Auth initialization
│   │   └── csrf.client.ts      # CSRF protection
│   │
│   ├── utils/
│   │   ├── rtl.ts              # RTL language detection
│   │   └── random.ts           # Random number utils
│   │
│   ├── server/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login.post.ts
│   │   │   │   ├── logout.post.ts
│   │   │   │   └── session.get.ts
│   │   │   ├── settings/
│   │   │   │   ├── index.get.ts
│   │   │   │   └── index.put.ts
│   │   │   └── upload/
│   │   │       └── image.post.ts
│   │   ├── database/
│   │   │   ├── client.ts       # Drizzle client
│   │   │   ├── schema.ts       # Database schema
│   │   │   └── migrations/
│   │   ├── middleware/
│   │   │   └── auth.ts         # Protect routes
│   │   └── utils/
│   │       └── password.ts     # Hashing
│   │
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── main.css          # Entry point (imports all, @layer order)
│   │   │   ├── reset.css         # CSS reset/normalize
│   │   │   ├── common/           # Base utilities (Q27)
│   │   │   │   ├── index.css
│   │   │   │   ├── spacing.css
│   │   │   │   ├── utilities.css
│   │   │   │   └── edge-cases.css
│   │   │   ├── colors/           # Color system (Q22, Q34)
│   │   │   │   ├── index.css
│   │   │   │   ├── auto.css
│   │   │   │   └── manual.css
│   │   │   ├── typography/       # Typography (Q29, Q32)
│   │   │   │   ├── index.css
│   │   │   │   ├── variables.css
│   │   │   │   ├── base.css
│   │   │   │   └── fonts/
│   │   │   ├── layout/           # Layout system (Q31)
│   │   │   │   ├── index.css
│   │   │   │   ├── grid.css
│   │   │   │   ├── containers.css
│   │   │   │   └── responsive.css
│   │   │   ├── animations/       # Motion (Q30)
│   │   │   │   ├── index.css
│   │   │   │   ├── keyframes.css
│   │   │   │   ├── transitions.css
│   │   │   │   └── reduced-motion.css
│   │   │   ├── skeleton/         # Layout structure
│   │   │   │   ├── index.css
│   │   │   │   ├── header.css
│   │   │   │   ├── footer.css
│   │   │   │   ├── nav.css
│   │   │   │   ├── mobile-nav.css
│   │   │   │   └── admin.css
│   │   │   └── ui/               # UI components (Q33)
│   │   │       ├── index.css
│   │   │       ├── forms/
│   │   │       ├── overlays/
│   │   │       └── content/
│   │   ├── icons/                # Project icons (SVG)
│   │   └── graphics/             # Illustrations, logos (SVG)
│   │
│   └── types/
│       └── index.ts            # Shared types
│
├── pages/                      # ══════ MINIMAL PAGES (Q15) ══════
│   ├── index.vue               # Main page (renders all sections)
│   ├── admin/                  # Admin routes (if adminPanel: true)
│   │   ├── index.vue           # Dashboard
│   │   ├── settings.vue        # Site settings
│   │   └── portfolio.vue       # Manage portfolio
│   └── error.vue               # Error page (404, 500)
│
├── components/                 # ══════ PROJECT SECTIONS (Q15) ══════
│   └── sections/               # Content sections (SOURCE OF TRUTH)
│       ├── HeroSection.vue     # order: 1, id: 'home'
│       ├── AboutSection.vue    # order: 2, id: 'about'
│       ├── PortfolioSection.vue # order: 3, id: 'portfolio'
│       ├── ContactSection.vue  # order: 4, id: 'contact'
│       └── index.ts            # Exports ordered sections array
│
├── assets/
│   └── styles/
│       └── project.css         # Project colors, fonts, custom
│
└── public/
    ├── favicon.ico
    └── images/                 # Project images
```

---

## 5. Core Layer Specification

### What Goes in Core

| Type | Contents | Auto-Import? |
|------|----------|--------------|
| **components/atoms/** | Logo, NavLink, HamburgerIcon, etc. | ✅ Yes |
| **components/molecules/** | NavLinks, SocialLinks, HeaderActions | ✅ Yes |
| **components/organisms/** | DesktopHeader, MobileNav, TheFooter | ✅ Yes |
| **components/templates/** | TheHeader (smart switcher) | ✅ Yes |
| **composables/** | useConfig, useAuth, useMediaQuery | ✅ Yes |
| **layouts/** | default, admin, blank | ✅ Yes |
| **plugins/** | auth.client, csrf.client | ✅ Yes |
| **utils/** | rtl, random, helpers | ✅ Yes |
| **server/api/** | Auth, settings, upload endpoints | N/A |
| **server/database/** | Drizzle schema, client, migrations | N/A |
| **assets/styles/** | main.css, reset.css, common/, colors/, typography/, layout/, animations/, skeleton/, ui/ | Via import |
| **assets/icons/** | UI icons (optional overrides) | Via import |
| **assets/graphics/** | Illustrations, logos (SVG) | Via import |
| **stores/** | Pinia stores (admin, etc.) | ✅ Yes |
| **types/** | Shared TypeScript types | Via import |

### Core nuxt.config.ts

```typescript
// core/nuxt.config.ts
import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  // Components auto-import
  components: [
    { path: './components', pathPrefix: false }
  ],

  // CSS - single entry point handles all imports
  css: [
    './assets/styles/main.css'         // Entry point (Q34: @layer architecture)
  ],

  // Modules (included in core)
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',                     // Q25: State management
    'unplugin-icons/nuxt'              // Q23: Icons
  ],

  // Icons (Q23)
  icons: {
    defaultCollection: 'tabler'        // Change to swap icon library
  },

  // Vite plugins (Q23: SVG graphics)
  vite: {
    plugins: [
      svgLoader({ defaultImport: 'component' })
    ]
  },

  // i18n defaults
  i18n: {
    locales: ['en', 'ru', 'he'],
    defaultLocale: 'en',
    strategy: 'prefix_except_default'
  },

  // Color mode defaults
  colorMode: {
    classSuffix: '',
    fallback: 'light'
  }
})
```

---

## 6. Project Layer Specification

### What Goes in Project (Root)

| Type | Contents |
|------|----------|
| **pages/** | Minimal: index.vue (renders sections), admin/, error.vue |
| **components/sections/** | Project sections (HeroSection, AboutSection, etc.) - Q15 |
| **assets/styles/project.css** | Override base colors, fonts, custom |
| **public/** | Images, favicon, static files |
| **puppet-master.config.ts** | Project settings (features, locales) |
| **app.vue** | Root component |

**Q15 Decision:** Sections are the SOURCE OF TRUTH for navigation. One boolean (`onepager`) switches between scroll-based and route-based navigation.

### Root nuxt.config.ts

```typescript
// nuxt.config.ts (root)
export default defineNuxtConfig({
  // Extend core layer
  extends: ['./core'],

  // Project-specific CSS
  css: [
    './assets/styles/project.css'
  ],

  // Override i18n if needed
  i18n: {
    defaultLocale: 'en'
  },

  // Runtime config from project config
  runtimeConfig: {
    public: {
      siteName: 'My Client Site',
      features: {
        multiLangs: true,
        doubleTheme: true,
        onepager: false,
        adminPanel: true
      }
    }
  }
})
```

---

## 7. Database Schema

### SQLite + Drizzle

```typescript
// core/server/database/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Site settings (editable via admin)
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

// Users (admin accounts)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('admin'),
  createdAt: integer('created_at', { mode: 'timestamp' })
});

// Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' })
});

// Portfolio items (example content type)
export const portfolioItems = sqliteTable('portfolio_items', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  order: integer('order').default(0),
  published: integer('published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

// Contact form submissions
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
});
```

### Settings Keys

| Key | Type | Description |
|-----|------|-------------|
| `site.name` | string | Site name |
| `site.tagline` | string | Site tagline |
| `contact.email` | string | Contact email |
| `contact.phone` | string | Contact phone |
| `contact.address` | string | Physical address |
| `social.telegram` | string | Telegram URL |
| `social.instagram` | string | Instagram URL |
| `social.whatsapp` | string | WhatsApp number |
| `seo.title` | string | Default page title |
| `seo.description` | string | Default meta description |
| `maps.embedUrl` | string | Google Maps embed URL |

---

## 8. CSS Architecture

### Color System (Q22 Decision)

**Modern CSS Color System** with auto-calculation from 4 base colors.

#### File Structure

```
core/assets/styles/colors/
├── index.css           # Entry point + primitives
├── auto.css            # Auto-calculated from 4 base colors
└── manual.css          # Explicit brandbook colors (optional)
```

#### Mode Toggle (One Comment)

```css
/* colors/index.css */
@layer primitives {
  :root {
    color-scheme: light dark;

    /* ═══════════════════════════════════════════════════════════
       BASE PRIMITIVES (Define these 4 in hex - Project overrides)
       ═══════════════════════════════════════════════════════════ */
    --p-black: #0f172a;     /* Default neutral - project overrides */
    --p-white: #f8fafc;
    --p-brand: #6366f1;     /* Default indigo */
    --p-accent: #8b5cf6;
  }
}

/* ═══════════════════════════════════════════════════════════
   🎛️ COLOR MODE: "auto" or "manual"
   Just comment/uncomment ONE line below:
   ═══════════════════════════════════════════════════════════ */

/* MODE: AUTO (default) */
@import 'auto.css' layer(semantic);

/* MODE: MANUAL (brandbook) */
/* @import 'manual.css' layer(semantic); */
```

#### Auto Mode (auto.css) - Semantic Layer

```css
/* colors/auto.css - All calculations reference primitives */
@layer semantic {
  :root {
    /* LAYOUT - auto from black/white */
    --l-bg: light-dark(var(--p-white), var(--p-black));
    --l-bg-elevated: light-dark(
      color-mix(in oklch, var(--p-white), var(--p-black) 5%),
      color-mix(in oklch, var(--p-black), var(--p-white) 8%)
    );
    --l-text: light-dark(var(--p-black), var(--p-white));
    --l-text-muted: color-mix(in oklch, var(--l-text), transparent 50%);
    --l-border: color-mix(in oklch, var(--l-text), transparent 85%);

    /* INTERACTIVE - auto from brand */
    --i-brand: var(--p-brand);
    --i-brand-hover: color-mix(in oklch, var(--p-brand), white 15%);
    --i-brand-active: color-mix(in oklch, var(--p-brand), black 15%);
    --i-brand-text: var(--p-white);

    /* DENOTIVES - fixed semantic hues, brand's energy */
    --d-success: oklch(from var(--p-brand) l c 145);  /* Green hue */
    --d-error: oklch(from var(--p-brand) l c 25);     /* Red hue */
    --d-warning: oklch(from var(--p-brand) l c 85);   /* Yellow hue */
    --d-info: oklch(from var(--p-brand) l c 250);     /* Blue hue */
  }
}
```

#### Token Naming Convention

| Prefix | Category | Example |
|--------|----------|---------|
| `--p-` | Primitive (base colors) | `--p-brand`, `--p-black` |
| `--l-` | Layout (backgrounds, text) | `--l-bg`, `--l-text` |
| `--i-` | Interactive (buttons, links) | `--i-brand-hover` |
| `--d-` | Denotives (semantic) | `--d-success`, `--d-error` |

#### Browser Support & Fallback

| Feature | Support | Status |
|---------|---------|--------|
| OKLCH | ~95% | ✅ Baseline 2023 |
| color-mix() | ~92% | ✅ Baseline 2023 |
| light-dark() | ~90% | ✅ Baseline 2024 |

```css
/* Fallback for ~10% older browsers */
@supports not (color: oklch(0% 0 0)) {
  :root {
    --l-bg: var(--p-white);
    --l-text: var(--p-black);
    --i-brand-hover: #f5a64d;
    --d-success: #22c55e;
    --d-error: #ef4444;
    --d-warning: #eab308;
    --d-info: #3b82f6;
  }
}
```

### Common Variables (Non-Color)

Variables are now split across organized folders:

```css
/* common/spacing.css */
@layer primitives {
  :root {
    /* Spacing (8px base) */
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-base: 300ms ease;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

    /* Border radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;
  }
}
```

```css
/* typography/variables.css */
@layer primitives {
  :root {
    /* Font stacks (project overrides these) */
    --font-body: system-ui, -apple-system, sans-serif;
    --font-heading: system-ui, -apple-system, sans-serif;
    --font-mono: 'SF Mono', Consolas, monospace;

    /* Fluid typography scale */
    --text-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
    --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1rem + 1vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
    --text-3xl: clamp(2rem, 1.5rem + 2vw, 3rem);
  }
}
```

```css
/* layout/containers.css */
@layer primitives {
  :root {
    --header-height: 4rem;
    --footer-height: auto;
    --container-max: 1200px;
    --container-padding: var(--space-4);
  }
}
```

### CSS Units Decision

| Use Case | Unit | Example |
|----------|------|---------|
| Fluid Typography | `clamp()` | `clamp(1rem, 0.9rem + 0.5vw, 1.125rem)` |
| Fluid Spacing | `clamp()` | `clamp(1rem, 0.8rem + 1vw, 1.5rem)` |
| Fixed Spacing | `rem` | `margin-bottom: 1.5rem` |
| Borders | `px` | `border: 1px solid` |
| Viewport Heights | `dvh` | `min-height: 100dvh` |
| Component Heights | `rem` | `height: 3rem` |
| Line Height | unitless | `line-height: 1.5` |

### RTL Support - CSS Logical Properties

```css
/* Use logical properties for automatic RTL support */
.element {
  /* ❌ Physical (doesn't flip for RTL) */
  margin-left: 1rem;
  padding-right: 1rem;
  text-align: left;

  /* ✅ Logical (automatically flips for RTL) */
  margin-inline-start: 1rem;
  padding-inline-end: 1rem;
  text-align: start;
}
```

### Layout - CSS Grid

```css
/* Default layout with sticky footer */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}

header { grid-row: 1; }
main { grid-row: 2; }
footer { grid-row: 3; }
```

---

## 8.1 Icons & SVG Graphics (Q23 Decision)

### UI Icons: unplugin-icons + Tabler

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['unplugin-icons/nuxt'],

  icons: {
    // Change this ONE line to swap icon library!
    defaultCollection: 'tabler',  // ~4,500 icons
    // Alternatives: 'lucide', 'heroicons', 'phosphor'
  }
})
```

```vue
<script setup>
import IconMenu from '~icons/tabler/menu-2'
import IconArrowRight from '~icons/tabler/arrow-right'
</script>

<template>
  <IconMenu class="icon" />
</template>
```

### SVG Graphics: vite-svg-loader

```ts
// nuxt.config.ts
import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  vite: {
    plugins: [svgLoader({ defaultImport: 'component' })]
  }
})
```

```vue
<script setup>
import HeroGraphic from '~/assets/graphics/hero.svg?component'
</script>

<template>
  <HeroGraphic class="hero-illustration" />
</template>
```

---

## 8.2 Forms & Validation (Q24 Decision)

### Native HTML5 + Zod + Custom CSS

**Client-side:**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.email" type="email" required />
    <textarea v-model="form.message" required minlength="10" />
    <button type="submit">Send</button>
  </form>
</template>
```

**Server-side:**
```ts
// server/api/contact.post.ts
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(1000),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.message })
  }
  // Process...
})
```

**CSS Form States:**
```css
input:invalid:not(:placeholder-shown) { border-color: var(--d-error); }
input:valid:not(:placeholder-shown) { border-color: var(--d-success); }
input:focus { box-shadow: 0 0 0 3px color-mix(in oklch, var(--i-brand), transparent 80%); }
```

---

## 8.3 State Management (Q25 Decision)

### Pinia (use sparingly)

| State Type | Solution |
|------------|----------|
| Component-local | `ref()` |
| Shared simple | `useState()` |
| Complex/Admin | Pinia store |

```ts
// stores/admin.ts
export const useAdminStore = defineStore('admin', () => {
  const sidebarOpen = ref(true)
  const unsavedChanges = ref(false)

  function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }

  return { sidebarOpen, unsavedChanges, toggleSidebar }
})
```

**NOT in Pinia:**
- Theme → `@nuxtjs/color-mode`
- Locale → `@nuxtjs/i18n`
- Server data → `useFetch`

---

## 8.4 Animation System (Q26, Q30 Decision)

### Animations Folder Structure

```
animations/
├── index.css           # Entry point (imports all)
├── keyframes.css       # @keyframes definitions
├── transitions.css     # Vue transitions, CSS transitions
└── reduced-motion.css  # Accessibility
```

### keyframes.css

```css
/* animations/keyframes.css */
@layer components {
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slide-up { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

  .animate-fade-in { animation: fade-in var(--transition-base) ease-out; }
  .animate-slide-up { animation: slide-up var(--transition-base) ease-out; }
  .animate-scale-in { animation: scale-in var(--transition-base) ease-out; }
}
```

### transitions.css

```css
/* animations/transitions.css */
@layer components {
  /* Vue Transition classes */
  .fade-enter-active, .fade-leave-active { transition: opacity var(--transition-base); }
  .fade-enter-from, .fade-leave-to { opacity: 0; }

  .slide-enter-active, .slide-leave-active { transition: transform var(--transition-base), opacity var(--transition-base); }
  .slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(1rem); }
}
```

### reduced-motion.css

```css
/* animations/reduced-motion.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## 8.5 Edge Cases & Browser Fixes (Q27 Decision)

### Dedicated edge-cases.css

All known browser caveats in one file:

```css
/* iOS Safari - prevent input zoom */
@supports (-webkit-touch-callout: none) {
  input, select, textarea { font-size: max(16px, 1rem); }
}

/* Safe areas (notch) */
body { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }

/* Tap highlight */
* { -webkit-tap-highlight-color: transparent; }

/* Overscroll */
html { overscroll-behavior: none; }

/* Dark mode autofill fix */
:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px var(--l-bg) inset !important; }

/* Focus visible (keyboard only) */
:focus:not(:focus-visible) { outline: none; }
:focus-visible { outline: 2px solid var(--i-brand); outline-offset: 2px; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

/* High contrast */
@media (forced-colors: active) {
  button, .btn { border: 2px solid currentColor !important; }
}

/* Scrollbars - See common/scrollbars.css for full customization */
* { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); }

/* RTL phone numbers */
[dir="rtl"] .phone-number { direction: ltr; unicode-bidi: isolate; }

/* Touch target minimum */
button, a { min-height: 44px; min-width: 44px; }
```

### Edge Cases Reference

| Issue | Solution |
|-------|----------|
| iOS 100vh bug | Use `100dvh` |
| iOS input zoom | `font-size: 16px` minimum |
| Safe areas | `env(safe-area-inset-*)` |
| Dark autofill | Custom `:-webkit-autofill` |
| Focus on click | `:focus-visible` not `:focus` |
| Reduced motion | `prefers-reduced-motion` query |
| RTL icons | `transform: scaleX(-1)` |
| Touch targets | Minimum 44x44px |
| Custom scrollbars | `common/scrollbars.css` |

### Custom Scrollbars

Full scrollbar customization via CSS variables in `common/scrollbars.css`:

```css
:root {
  --scrollbar-width: 8px;
  --scrollbar-width-thin: 4px;
  --scrollbar-radius: 4px;
  --scrollbar-track: transparent;
  --scrollbar-thumb: color-mix(in oklch, var(--l-text) 20%, transparent);
  --scrollbar-thumb-hover: color-mix(in oklch, var(--l-text) 40%, transparent);
}
```

**Utility Classes:**
| Class | Effect |
|-------|--------|
| `.scrollbar-thin` | Thinner scrollbar (4px) |
| `.scrollbar-hidden` | Hidden but still scrollable |
| `.scrollbar-hover` | Only visible on hover |
| `.scrollbar-brand` | Brand-colored scrollbar |
| `.scrollbar-accent` | Accent-colored scrollbar |
| `.scroll-x` | Horizontal scroll with snap |
| `.scroll-y` | Vertical scroll with snap |

---

## 8.6 CSS vs Component Organization (Critical Clarification)

### Two Separate Organizational Systems

Puppet Master uses **two different organizational paradigms** that work together but are NOT the same:

| Concern | What It Organizes | Naming Convention | Files |
|---------|-------------------|-------------------|-------|
| **CSS Architecture** | Stylesheets | By **domain/purpose** | `.css` files |
| **Component Architecture** | Vue components | By **atomic level** | `.vue` files |

**These do NOT need to match naming!**

### How They Work Together

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CSS ORGANIZATION (by domain)          VUE ORGANIZATION (by atomic level)  │
│  ─────────────────────────────         ──────────────────────────────────  │
│                                                                             │
│  styles/                               components/                          │
│  ├── colors/                           ├── atoms/                           │
│  │   └── (color system)                │   ├── Logo.vue                     │
│  ├── typography/                       │   ├── NavLink.vue                  │
│  │   └── (font system)                 │   ├── ThemeToggle.vue              │
│  ├── layout/                           │   └── CtaButton.vue                │
│  │   └── (grid, containers)            │                                    │
│  ├── skeleton/                         ├── molecules/                       │
│  │   ├── header.css ─────────────────→ │   ├── NavLinks.vue                 │
│  │   ├── footer.css ─────────────────→ │   └── HeaderActions.vue            │
│  │   └── nav.css ────────────────────→ │                                    │
│  └── ui/                               ├── organisms/                       │
│      ├── forms/                        │   ├── DesktopHeader.vue ←uses──────┤
│      │   └── inputs.css ─────────────→ │   ├── TheFooter.vue ←uses──────────┤
│      └── overlays/                     │   └── MobileNav.vue ←uses──────────┤
│          └── modal.css                 │                                    │
│                                        └── templates/                       │
│                                            └── TheHeader.vue                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why No `atoms/` Folder in CSS?

CSS is organized by **domain** (what the styles affect), not atomic level:

| CSS Folder | Contains Styles For | Used By Components |
|------------|--------------------|--------------------|
| `colors/` | Color variables, themes | All components |
| `typography/` | Font families, sizes, scales | All text |
| `layout/` | Grid, containers, responsive | Layout components |
| `skeleton/` | Header, footer, nav layouts | Organisms |
| `ui/forms/` | Inputs, buttons, selects | Atoms + Molecules |
| `ui/overlays/` | Modals, dropdowns, tooltips | Organisms |

### Where Do "Skeleton" Components Go in Atomic Design?

"Skeleton" is a **domain concept** (fixed layout parts), not an atomic level:

| Component | Atomic Level | Why? |
|-----------|--------------|------|
| `Logo.vue` | **Atom** | Single, indivisible element |
| `NavLink.vue` | **Atom** | Single link |
| `NavLinks.vue` | **Molecule** | Composed of NavLink atoms |
| `DesktopHeader.vue` | **Organism** | Complete, self-contained section |
| `TheFooter.vue` | **Organism** | Complete section |
| `TheHeader.vue` | **Template** | Switches between Desktop/Mobile |

### The 3-Layer CSS System (Primitives → Semantic → Components)

The 3 layers exist **INSIDE the CSS files** via `@layer`, not as separate folders:

```css
/* colors/auto.css */
@layer primitives {
  :root { --p-brand: #ef922d; }    /* Raw value */
}

@layer semantic {
  :root { --c-brand: oklch(from var(--p-brand) l c h); }  /* Calculated */
}

/* skeleton/header.css */
@layer components {
  .site-header { background: var(--c-brand); }  /* Uses semantic token */
}
```

### Summary

| Question | Answer |
|----------|--------|
| Why no `atoms/` folder in CSS? | CSS = organized by domain, not atomic level |
| Where do skeleton components go? | In `organisms/` (they're complete sections) |
| How do 3 CSS layers work? | `@layer` declarations INSIDE CSS files |
| Is there conflict? | NO! Two separate systems that complement each other |

---

## 8.7 CSS Layer Architecture (Q34 Decision)

### 3-Layer System: Primitives → Semantic → Components

The CSS architecture uses CSS `@layer` for proper cascade control and clear separation between Core and Project.

#### main.css Entry Point

```css
/* styles/main.css */

/* Layer order declaration - determines cascade priority */
@layer reset, primitives, semantic, components, utilities;

/* Imports with explicit layer assignments */
@import './reset.css' layer(reset);
@import './colors/index.css' layer(primitives);
@import './common/index.css' layer(utilities);
@import './typography/index.css' layer(primitives);
@import './layout/index.css' layer(components);
@import './animations/index.css' layer(components);
@import './skeleton/index.css' layer(components);
@import './ui/index.css' layer(components);
```

#### Core vs Project Separation

| Layer | Purpose | Defined In |
|-------|---------|------------|
| **reset** | CSS reset/normalize | Core (never changes) |
| **primitives** | Raw values (colors, fonts, spacing) | Core defaults + Project overrides |
| **semantic** | Calculations (color-mix, light-dark) | Core (never changes) |
| **components** | UI element styling | Core (uses semantic tokens) |
| **utilities** | Helper classes | Core (never changes) |

#### How Projects Override

```css
/* project/assets/styles/brand.css */
@layer primitives {
  :root {
    /* Override Core's default values */
    --p-brand: #ef922d;       /* Client's orange */
    --p-black: #001427;
    --p-white: #e4e9ed;
    --p-accent: #7c3aed;

    /* Override fonts */
    --font-body: 'Montserrat', sans-serif;
    --font-heading: 'Montserrat', sans-serif;
  }
}
```

**Result:** Core works standalone with neutral defaults. Project only overrides primitives. Semantic calculations auto-update. Component styling unchanged.

---

## 8.8 Layout System (Q31 Decision)

### Layout Folder Structure

```
layout/
├── index.css           # Entry point
├── grid.css            # CSS Grid system
├── containers.css      # Container definitions
└── responsive.css      # Portrait/landscape, breakpoints
```

### Grid System (grid.css)

```css
/* layout/grid.css */
@layer components {
  .grid {
    display: grid;
    gap: var(--space-4);
  }

  .grid-cols-1 { grid-template-columns: 1fr; }
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

  /* Auto-fit for responsive grids */
  .grid-auto-fit { grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); }
  .grid-auto-fill { grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); }
}
```

### 2025 Container System (containers.css)

**Philosophy: Full-width by default, constrain only when needed.**

```css
/* layout/containers.css */
:root {
  /* Content widths - semantic names, easy to change */
  --content-prose: 65ch;              /* Optimal reading width */
  --content-narrow: min(768px, 100%); /* Narrow content */
  --content-default: min(1280px, 100%); /* Default content width */
  --content-wide: min(1536px, 100%);  /* Wide content */
  --content-full: 100%;               /* Full width */

  /* Fluid padding - scales with viewport */
  --container-padding: clamp(1rem, 3vw, 3rem);
}

.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--container-padding);
}

/* Width modifiers */
.container-prose { max-width: var(--content-prose); }
.container-narrow { max-width: var(--content-narrow); }
.container-default { max-width: var(--content-default); }
.container-wide { max-width: var(--content-wide); }
.container-full { max-width: var(--content-full); }
.container-bleed { max-width: none; padding-inline: 0; }

/* Container queries */
.cq { container-type: inline-size; }
.cq-normal { container-type: normal; }
```

### 2025 Holy Grail Responsive System (responsive.css)

**Philosophy:**
1. **FLUID FIRST** - Use `clamp()` for typography/spacing (no breakpoints!)
2. **INTRINSIC LAYOUTS** - Use auto-fit/minmax grids (self-adapting!)
3. **CONTAINER QUERIES** - Components own their responsive behavior
4. **MEDIA QUERIES** - Only for page-level layout (header/nav visibility)

**Breakpoint System:**

Uses `postcss-custom-media` for reusable breakpoints (single source of truth in `breakpoints.css`):

| Name | Value | Target | CSS Usage |
|------|-------|--------|-----------|
| `--phone` | max-width: 639px | Phones only | `@media (--phone)` |
| `--tablet` | min-width: 640px | Tablets + up | `@media (--tablet)` |
| `--desktop` | min-width: 1024px | Desktops + up | `@media (--desktop)` |
| `--large` | min-width: 1280px | Large screens | `@media (--large)` |
| `--below-desktop` | max-width: 1023px | Phones + tablets | `@media (--below-desktop)` |

```css
/* layout/breakpoints.css - @custom-media definitions */
@custom-media --phone (max-width: 639px);
@custom-media --tablet (min-width: 640px);
@custom-media --desktop (min-width: 1024px);
@custom-media --large (min-width: 1280px);
@custom-media --below-desktop (max-width: 1023px);
```

```css
/* layout/responsive.css - usage example */

/* Mobile-first: nav hidden by default */
.header-nav { display: none !important; }
.mobile-menu-btn { display: flex !important; }

/* Desktop: show nav, hide mobile button */
@media (--desktop) {
  .header-nav { display: flex !important; }
  .mobile-menu-btn { display: none !important; }
}

/* Container query responsive utilities */
@container (min-width: 500px) {
  .cq-grid-2 { grid-template-columns: repeat(2, 1fr); }
}

/* Orientation utilities (use sparingly) */
@media (orientation: portrait) {
  .hide-portrait { display: none !important; }
  .stack-portrait { flex-direction: column !important; }
}
```

**Note:** `!important` is intentional for utility classes - they are in the `utilities` layer and need to override component styles.

### Auto-Fit Grids: The TRUE Holy Grail

```css
/* These grids adapt WITHOUT any media queries! */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--space-4);
}
```
This is the secret weapon - items wrap automatically based on available space!

---

## 8.9 Interactive Header & Mobile UX

### Interactive Header (Scroll-Based)

The header supports scroll-based style changes for a more interactive feel:

| Feature | CSS Class | Description |
|---------|-----------|-------------|
| **Scrolled state** | `.header--scrolled` | Applied when page scrolled past threshold |
| **Hidden state** | `.header--hidden` | Applied when scrolling down (if enabled) |
| **Visible state** | `.header--visible` | Applied when scrolling up after being hidden |

**Configuration:**
```typescript
// puppet-master.config.ts
features: {
  interactiveHeader: true,    // Enable scroll-based header changes
  hideHeaderOnScroll: false   // Hide header when scrolling down
}
```

**CSS Variables for Customization:**
```css
:root {
  --header-scrolled-height: clamp(48px, 6vh, 56px);
  --header-scrolled-bg: color-mix(in oklch, var(--l-bg) 95%, transparent);
  --header-scrolled-shadow: 0 2px 8px oklch(0% 0 0 / 0.1);
  --header-scrolled-backdrop: blur(12px);
  --header-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Composable Usage:**
```typescript
const { headerClasses, isScrolled, isHidden, scrollDirection } = useScrollHeader({
  threshold: 50,        // Pixels to scroll before "scrolled" state
  hideOnScroll: false,  // Enable hide-on-scroll-down behavior
  scrollDelta: 10       // Minimum scroll delta to trigger hide/show
})
```

### Mobile Header UX (NN/g Best Practices)

Following Nielsen Norman Group research for mobile navigation:

| Element | Position | Rationale |
|---------|----------|-----------|
| **Hamburger** | Top-left | NN/g research shows left placement is more discoverable |
| **Logo** | Center | Balanced layout, brand visibility |
| **Spacer** | Top-right | Maintains visual balance |
| **Theme/Language** | Inside mobile menu | Reduces header clutter |

**Mobile Menu Animation:**
- Hamburger animates first (200ms delay before menu appears)
- Menu slides in with smooth cubic-bezier easing
- Backdrop fades in simultaneously
- RTL-aware: slides from left in RTL languages

### Hamburger Menu Animations

5 animation types available (from Hamburgers library):

| Class | Animation |
|-------|-----------|
| `hamburger--squeeze` | Clean X animation (default) |
| `hamburger--spin` | Rotating animation |
| `hamburger--elastic` | Bouncy animation |
| `hamburger--collapse` | Collapse to X |
| `hamburger--slider` | Slide animation |

**CSS Variables:**
```css
:root {
  --hamburger-padding: 0.75rem;
  --hamburger-width: 28px;
  --hamburger-height: 3px;
  --hamburger-spacing: 6px;
  --hamburger-color: currentColor;
  --hamburger-active-color: var(--hamburger-color);
  --hamburger-radius: 2px;
}
```

---

## 8.10 Vue 3 Performance Best Practices (Q28 Decision)

### Performance Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| `v-memo` | Prevent re-renders of expensive list items | `v-memo="[item.id, item.selected]"` |
| `:key` | Force re-render when needed | `:key="uniqueId"` |
| `shallowRef` | Large arrays/objects that update wholesale | `const items = shallowRef([])` |
| `computed` | Derived values (cached until deps change) | `computed(() => items.value.filter(...))` |
| Avoid inline functions | Prevent function recreation each render | Define methods separately |

### v-memo Example

```vue
<template>
  <div v-for="item in items" :key="item.id" v-memo="[item.id, item.selected]">
    <!-- This block only re-renders when item.id or item.selected changes -->
    <ExpensiveComponent :item="item" />
  </div>
</template>
```

### shallowRef for Large Data

```typescript
// Heavy list - only trigger updates on reassignment
const portfolioItems = shallowRef<PortfolioItem[]>([])

// ❌ This won't trigger update
portfolioItems.value.push(newItem)

// ✅ This triggers update
portfolioItems.value = [...portfolioItems.value, newItem]
```

### Smooth Animations with requestAnimationFrame

```typescript
// For scroll-based animations
function onScroll() {
  requestAnimationFrame(() => {
    // DOM updates here
  })
}
```

---

## 9. Configuration System

> **MOTTO: "The config file is the developer's best friend!"**

### Two-Tier Configuration

```
┌─────────────────────────────────────────────────────────────┐
│  BUILD-TIME CONFIG (puppet-master.config.ts)                │
│  Developer defines STRUCTURE, SCHEMA, BEHAVIOR              │
├─────────────────────────────────────────────────────────────┤
│  features: { multiLangs, doubleTheme, onepager, ... }       │
│  sections: [{ id, inNav }]                                  │
│  locales: [{ code, iso, name }]                             │
│  settings: [{ key, type, group, label, showIn }] ← SCHEMA   │
│  settingGroups: [{ key, label, icon }]                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
              Developer defines WHICH settings exist
              and WHERE they appear on the website
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  RUNTIME VALUES (SQLite settings table)                     │
│  Client/Admin enters VALUES via Admin Panel                 │
├─────────────────────────────────────────────────────────────┤
│  site.name = "My Studio"                                    │
│  contact.email = "hello@mystudio.com"                       │
│  social.instagram = "https://instagram.com/mystudio"        │
│  ... (all values entered via Admin Panel, NOT config!)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    useSiteSettings()

```

### Settings Schema (Config-Driven)

The developer defines the **schema** of settings in `puppet-master.config.ts`.
The **values** are entered by the client via the Admin Panel.

```typescript
// puppet-master.config.ts
settings: [
  // key        - Unique identifier (group.name format)
  // type       - Input type for admin UI
  // group      - Admin panel grouping
  // label      - Human-readable label
  // showIn     - WHERE this setting appears on the website

  { key: 'site.name', type: 'string', group: 'site', label: 'Site Name', showIn: ['header', 'footer', 'seo'] },
  { key: 'site.tagline', type: 'string', group: 'site', label: 'Tagline', showIn: ['hero', 'seo'] },
  { key: 'contact.email', type: 'email', group: 'contact', label: 'Email', showIn: ['footer', 'contact-section'] },
  { key: 'social.instagram', type: 'url', group: 'social', label: 'Instagram', showIn: ['footer'] },
  // ...
],

settingGroups: [
  { key: 'site', label: 'Site Identity', icon: 'settings' },
  { key: 'contact', label: 'Contact Info', icon: 'mail' },
  // ...
]
```

**How it works:**
1. Developer adds a setting to `settings` array
2. Seed script creates empty DB record for that setting
3. Admin Panel automatically shows the field (based on schema)
4. Client enters value via Admin Panel
5. Components use `useSiteSettings()` to display values
6. `showIn` tells components when to render (optional for documentation)
```

### Composables

```typescript
// useConfig() - Build-time features
const { multiLangs, doubleTheme, onepager, adminPanel } = useConfig()

// useSiteSettings() - Runtime content
const { siteName, contactEmail, socialLinks } = useSiteSettings()

// useMediaQuery() - Reactive CSS media query (for header switching)
// Uses width-based breakpoints for reliable behavior
const isDesktop = useMediaQuery('(min-width: 1024px)')
```

### useMediaQuery Composable

```typescript
// core/composables/useMediaQuery.ts
// Generic composable - query can be orientation OR width based
export function useMediaQuery(query: string) {
  const matches = ref(false)

  if (import.meta.client) {
    const mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    const handler = (e: MediaQueryListEvent) => {
      matches.value = e.matches
    }

    mediaQuery.addEventListener('change', handler)
    onUnmounted(() => mediaQuery.removeEventListener('change', handler))
  }

  return matches
}

// Usage examples:
// Orientation-based (current approach):
//   useMediaQuery('(orientation: landscape)')
//
// Width-based (if we decide to change):
//   useMediaQuery('(min-width: 768px)')
//
// Hybrid (if we decide on option C):
//   useMediaQuery('(orientation: landscape) and (min-width: 768px)')
```

---

## 10. Feature Toggles

| Feature | Config Key | Default | Effect |
|---------|------------|---------|--------|
| **Multi-language** | `multiLangs` | `true` | Show language switcher |
| **Theme toggle** | `doubleTheme` | `true` | Show light/dark toggle |
| **One-pager mode** | `onepager` | `false` | Scroll-based navigation |
| **Admin panel** | `adminPanel` | `true` | Enable /admin routes |
| **Interactive header** | `interactiveHeader` | `true` | Header style changes on scroll |
| **Hide header on scroll** | `hideHeaderOnScroll` | `false` | Hide header when scrolling down, show on up |

### One-Pager vs SPA Mode (Q15 Decision)

**Sections are the source of truth** - NOT pages, NOT config routes.

```
components/sections/
  HeroSection.vue      (order: 1, id: 'home')
  AboutSection.vue     (order: 2, id: 'about')
  ServicesSection.vue  (order: 3, id: 'services')
  ContactSection.vue   (order: 4, id: 'contact')
```

Each section defines its own metadata:
```vue
<!-- components/sections/AboutSection.vue -->
<script setup>
defineOptions({
  section: {
    id: 'about',
    order: 2,
    navLabel: 'nav.about',  // i18n key
    showInNav: true
  }
})
</script>
```

**Automatic mode switching based on `onepager` boolean:**

| Mode | Nav Items | Link Behavior | Content |
|------|-----------|---------------|---------|
| `onepager: true` | Same | `#about` (scroll) | All sections on index.vue |
| `onepager: false` | Same | `/about` (navigate) | Each section wrapped in own page |

**NavLink handles both modes automatically:**
```vue
<script setup>
const config = useAppConfig()

const to = computed(() => {
  if (config.onepager) {
    return { path: '/', hash: `#${props.id}` }  // Scroll to section
  }
  return { path: `/${props.id === 'home' ? '' : props.id}` }  // Navigate
})
</script>
```

**Pages are thin wrappers (SPA mode):**
```vue
<!-- pages/about.vue -->
<template>
  <main><AboutSection /></main>
</template>
```

**Benefits:**
- ZERO duplication - sections are single source of truth
- Boolean toggle switches behavior automatically
- No separate config for onepager vs SPA

---

## 11. Authentication

### Simple Session-Based Auth

```typescript
// core/server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  // Verify credentials
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (!user || !await verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  // Create session
  const sessionId = crypto.randomUUID()
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  })

  // Set cookie
  setCookie(event, 'session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  })

  return { success: true }
})
```

### Protected Routes

```typescript
// core/server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Only protect /api/admin/* routes
  if (!event.path.startsWith('/api/admin')) return

  const sessionId = getCookie(event, 'session')
  if (!sessionId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    throw createError({ statusCode: 401, message: 'Session expired' })
  }

  event.context.user = session.user
})
```

---

## 12. Internationalization

### Using @nuxtjs/i18n

```typescript
// core/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'en', name: 'English', dir: 'ltr' },
      { code: 'ru', name: 'Русский', dir: 'ltr' },
      { code: 'he', name: 'עברית', dir: 'rtl' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected'
    }
  }
})
```

### RTL Detection

```typescript
// core/utils/rtl.ts
const RTL_LANGUAGES = ['he', 'ar', 'fa', 'ur']

export function isRtlLanguage(locale: string): boolean {
  return RTL_LANGUAGES.includes(locale)
}
```

```vue
<!-- app.vue -->
<template>
  <div :dir="isRtl ? 'rtl' : 'ltr'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const isRtl = computed(() => isRtlLanguage(locale.value))
</script>
```

---

## 13. Image Processing (Q16 Decision)

### Hybrid Strategy: Build-time + On-the-fly

| Image Type | Processing | When |
|------------|------------|------|
| **Static** (logo, icons, bg) | Build-time presets | During `nuxt build` |
| **CMS-uploaded** (portfolio, blog) | On-the-fly + cache | First request, cached after |

### Key Principle: CSS Controls Sizing

**Separation of concerns:**
- **Display size** → CSS (how big image appears)
- **Source selection** → `sizes` attribute (which optimized version to load)

```vue
<!-- CORRECT: No hardcoded pixel sizes in component -->
<NuxtImg
  :src="image.src"
  :alt="image.alt"
  sizes="sm:100vw md:50vw lg:400px"  <!-- Viewport hints only -->
  format="webp"
  loading="lazy"
  class="portfolio-image"            <!-- CSS handles actual sizing -->
/>
```

```css
/* CSS controls display size */
.portfolio-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  aspect-ratio: 16/9;
}
```

### Nuxt Image Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],

  image: {
    provider: 'ipx',

    // Static assets: pre-processed at build
    presets: {
      logo: { modifiers: { format: 'webp', quality: 90 } },
      hero: { modifiers: { format: 'webp', quality: 80 } }
    },

    // Default format preference (browser picks best supported)
    format: ['avif', 'webp'],

    // Lazy loading by default
    loading: 'lazy'
  }
})
```

### Upload Endpoint with Sharp (CMS Images)

```typescript
// core/server/api/upload/image.post.ts
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const file = formData?.find(f => f.name === 'image')

  if (!file?.data) {
    throw createError({ statusCode: 400, message: 'No image provided' })
  }

  const id = randomUUID()
  const uploadDir = './public/uploads'
  await mkdir(uploadDir, { recursive: true })

  // Process: resize + convert to WebP (max size, not display size)
  const processed = await sharp(file.data)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  // Generate thumbnail for admin previews
  const thumbnail = await sharp(file.data)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer()

  await writeFile(`${uploadDir}/${id}.webp`, processed)
  await writeFile(`${uploadDir}/${id}-thumb.webp`, thumbnail)

  // IPX will generate other sizes on-the-fly when requested
  return {
    url: `/uploads/${id}.webp`,
    thumbnailUrl: `/uploads/${id}-thumb.webp`
  }
})
```

---

## 14. Deployment (Q17 + Q21 Decision)

### Strategy: VPS + Docker + Kamal

**Kamal** (by 37signals) for zero-downtime deployments:
- Default deployment tool in **Rails 8** (January 2025)
- Zero-downtime via **kamal-proxy** (Traefik-based)
- Simple commands: `kamal deploy`, `kamal rollback`
- Works with any VPS + Docker registry

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# SQLite database stored in volume
VOLUME /app/data

ENV DATABASE_URL=/app/data/sqlite.db
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

### Kamal Configuration

```yaml
# config/deploy.yml
service: puppet-master
image: your-registry/puppet-master

servers:
  web:
    - your-vps-ip

registry:
  server: ghcr.io
  username: your-username
  password:
    - KAMAL_REGISTRY_PASSWORD

env:
  DATABASE_URL: /app/data/sqlite.db

volumes:
  - /data/puppet-master:/app/data
  - /data/puppet-master/uploads:/app/public/uploads
```

### npm Script Wrappers

```json
{
  "scripts": {
    "deploy": "kamal deploy",
    "rollback": "kamal rollback",
    "logs": "kamal app logs",
    "shell": "kamal app exec -i bash"
  }
}
```

### Deployment Commands

```bash
# Deploy (zero-downtime)
npm run deploy

# Rollback to previous version
npm run rollback

# View logs
npm run logs

# SSH into container
npm run shell
```

---

## 15. System/Browser Detection (Q19 Decision)

### Architecture

Three-layer detection system:

| Layer | File | Purpose |
|-------|------|---------|
| **Device** | `useDevice.ts` | Device type, browser, OS, touch |
| **Features** | `useCrossBrowserCompatibility.ts` | Feature detection + browser fixes |
| **CSS** | `device-specific.css` | Browser/OS-specific styling |

### useDevice.ts - What to Detect

```typescript
// KEEP these detections
interface DeviceInfo {
  // Device type
  type: 'mobile' | 'tablet' | 'desktop'

  // Browser
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'samsung' | 'unknown'

  // Operating System
  os: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown'

  // Capabilities
  supportsTouch: boolean
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
}

// Convenience booleans
const { isMobile, isTablet, isDesktop, isSafari, isIos, isSamsung } = useDevice()
```

### useCrossBrowserCompatibility.ts - Features to Detect

```typescript
// KEEP (still relevant)
interface FeatureSupport {
  webp: boolean              // Image format
  avif: boolean              // Image format
  cssContainerQueries: boolean  // For responsive components
  cssCustomProperties: boolean  // CSS variables support
}

// ADD (modern requirements)
interface UserPreferences {
  prefersReducedMotion: boolean   // Accessibility
  prefersColorScheme: 'light' | 'dark'  // Theme sync
  prefersContrast: 'normal' | 'high'    // Accessibility
}

// REMOVE (obsolete - 96%+ support)
// - intersectionObserver (don't need polyfill)
// - resizeObserver (don't need polyfill)
// - cssGrid (don't need fallback)
// - cssFlexbox (don't need fallback)
// - webgl, webgl2 (not needed for landing pages)
```

### Browser-Specific Fixes (KEEP)

```typescript
// iOS Safari (ESSENTIAL)
- 100vh fix: --vh custom property
- Safe area insets: env(safe-area-inset-*)
- Scroll bounce prevention
- Momentum scrolling

// Samsung Internet
- Input zoom prevention (font-size: 16px)
- Video playsinline attribute

// General
- Touch target minimum 44px
- Tap highlight color
```

### CSS Classes Applied to <html>

```html
<!-- Device -->
<html class="device-mobile os-ios browser-safari touch-device">

<!-- Features -->
<html class="supports-webp supports-avif supports-container-queries">

<!-- Preferences -->
<html class="prefers-dark prefers-reduced-motion">
```

### Accessibility Preferences (ADD)

```typescript
// useAccessibilityPreferences.ts
export function useAccessibilityPreferences() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersColorScheme = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersContrast = useMediaQuery('(prefers-contrast: more)')

  return { prefersReducedMotion, prefersColorScheme, prefersContrast }
}
```

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9.1 Configuration System Details (Q20 Decision)

### Two-Tier Configuration

| Tier | Location | Contents | Who Changes |
|------|----------|----------|-------------|
| **Build-time** | `puppet-master.config.ts` | Features, locales | Developer |
| **Runtime** | SQLite (via Admin) | Site info, SEO, contact | Client |

### CSS Variables for Theming

**See Section 8 (CSS Architecture) for the complete Q22 OKLCH Color System.**

Summary: Uses modern CSS with OKLCH, `color-mix()`, and `light-dark()`:
- **4 base colors in HEX** define everything (--p-black, --p-white, --p-brand, --p-accent)
- **Auto-calculated** shades, surfaces, borders via `color-mix(in oklch, ...)`
- **Light/dark mode** via single `light-dark()` function
- **Two modes**: Auto (from 4 colors) or Manual (brandbook colors)

### What Goes Where

| Category | Location | Reason |
|----------|----------|--------|
| `multiLangs`, `doubleTheme`, `onepager` | Config file | Affects build |
| `locales`, `defaultLocale` | Config file | Affects routing |
| Colors, spacing, typography | CSS Variables | Easy theming |
| Site name, tagline | CMS (SQLite) | Client edits |
| Contact info | CMS (SQLite) | Client edits |
| Social links | CMS (SQLite) | Client edits |
| SEO (title, description) | CMS (SQLite) | Client edits |

---

## 16. Decisions Log

### Summary of All Architectural Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| D1 | Backend technology | Nuxt Nitro (drop Python) | Simpler stack, one language |
| D2 | Database | SQLite + Drizzle | Simple, fast, file-based, sufficient for use case |
| D3 | Architecture | Nuxt Layers (core + project) | Separation of reusable code |
| D4 | Imports | Auto-imports (not ~/) | Required for layers to work |
| D5 | CSS units | Hybrid clamp() + rem + dvh | Modern, fluid, mobile-friendly |
| D6 | RTL support | CSS Logical Properties | Automatic, no build step |
| D7 | Config system | Two-tier (build + runtime) | Developer vs client control |
| D8 | Auth | Session-based, cookies | Simple, secure, no JWT complexity |
| D9 | Image processing | Hybrid (build-time + IPX on-the-fly) | CSS controls sizing |
| D10 | i18n | @nuxtjs/i18n | Official module, well-maintained |
| D11 | Theme | @nuxtjs/color-mode | Official module, CSS variables |
| D12 | One-pager/SPA | Feature toggle | Config-driven |
| D13 | Navigation | Sections as source of truth | Zero duplication, auto-mode-switch |
| D14 | Deployment | VPS + Docker + Kamal | Zero-downtime, rollback, npm wrappers |
| D15 | CSS approach | Pure CSS (no framework) | Full control, handle all edge cases |
| D16 | System detection | useDevice + useCrossBrowserCompatibility | Simplified, modernized |
| D17 | Configuration | CSS Variables + two-tier config | Native theming, clear separation |
| D18 | Deployment tool | Kamal (by 37signals) | Zero-downtime, rollback, simple commands |
| D19 | Color system | Modern CSS (OKLCH, color-mix, light-dark) | Auto-calculate from 4 base colors |
| D20 | Icons | unplugin-icons + Tabler (default) | 4,500 icons, swappable, build-time |
| D21 | SVG Graphics | vite-svg-loader | Build-time inline, tree-shake |
| D22 | Forms | Native HTML5 + Zod + Custom CSS | Zero client bundle, server validation |
| D23 | State management | Pinia (use sparingly) | Industry standard, DevTools support |
| D24 | Animation | CSS animations.css + Vue Transition | No library, reduced motion support |
| D25 | Edge cases | Dedicated edge-cases.css | All browser fixes in one place |
| D26 | Vue Performance | v-memo, shallowRef, requestAnimationFrame patterns | Prevent common performance issues |
| D27 | Typography | Folder structure with fonts/ | Clear separation, easy font swapping |
| D28 | Animation organization | Folder with keyframes, transitions, reduced-motion | Clear separation of concerns |
| D29 | Layout system | Grid + container queries + orientation | Modern, component-level responsive |
| D30 | Font handling | Google Fonts + self-hosted custom | Fast, consistent, no ugly system fonts |
| D31 | UI components | ui/ folder with forms/overlays/content | Style ALL native elements |
| D32 | CSS architecture | 3-layer (primitives→semantic→components) | Core defaults, Project overrides primitives only |

### Questions Resolved

| # | Question | Decision |
|---|----------|----------|
| Q1 | Config system | Hybrid: build-time features + runtime content |
| Q2 | RTL cleanup | Consolidated to utils/rtl.ts |
| Q3 | PostCSS RTL | Use CSS Logical Properties instead |
| Q4 | plugins/i18n.ts conflict | Delete, use @nuxtjs/i18n only |
| Q5 | Type system | Simplified to types/index.ts |
| Q6 | Dead code | Deleted all empty files |
| Q7 | Responsive strategy | ✅ 2025 Holy Grail: fluid CSS + auto-fit grids + container queries + width breakpoints |
| Q8 | CSS migration | ❌ OBSOLETE (fresh start) |
| Q9 | Hardcoded values | ❌ OBSOLETE (fresh start) |
| Q10 | Numbered pages | ❌ OBSOLETE (fresh start) |
| Q11 | lib/ cleanup | Keep utils/, delete lib/utils and lib/plugins |
| Q12 | types/ cleanup | Keep simplified types/index.ts |
| Q13 | services/ | Keep for API service layer |
| Q14 | Architecture | Nuxt Layers (core + project separation) |
| Q15 | Navigation/Routes | ✅ Sections as source of truth, auto onepager/SPA |
| Q16 | Image handling | ✅ Hybrid (build-time + on-the-fly), CSS controls sizing |
| Q17 | Deployment | ✅ VPS + Docker |
| Q18 | CSS framework | ✅ Pure CSS, handle all edge cases |
| Q19 | System detection | ✅ Keep useDevice + useCrossBrowserCompatibility, modernize |
| Q20 | Configuration | ✅ CSS Variables + two-tier (config + CMS) |
| Q21 | DevOps/Deployment | ✅ Kamal with npm script wrappers |
| Q22 | Color system | ✅ Modern CSS (OKLCH, color-mix, light-dark) with auto/manual toggle |
| Q23 | Icons & SVG | ✅ unplugin-icons + Tabler (default), vite-svg-loader for graphics |
| Q24 | Forms & Validation | ✅ Native HTML5 (client) + Zod (server) + Custom CSS |
| Q25 | State Management | ✅ Pinia (industry standard, use sparingly) |
| Q26 | Animation | ✅ CSS animations.css + Vue Transition + reduced motion |
| Q27 | Edge Cases | ✅ Dedicated edge-cases.css with ALL browser fixes |
| Q28 | Vue Performance | ✅ Add section: v-memo, shallowRef, requestAnimationFrame |
| Q29 | Typography | ✅ Folder structure with fonts/ subfolder |
| Q30 | Animations | ✅ Folder structure (keyframes, transitions, reduced-motion) |
| Q31 | Layout System | ✅ 2025 Holy Grail: auto-fit grids + container queries + fluid CSS + width breakpoints |
| Q32 | Font Handling | ✅ Google Fonts + self-hosted, NO system fonts in design |
| Q33 | UI Components | ✅ ui/ folder with forms/, overlays/, content/ subfolders |
| Q34 | Core/Project CSS | ✅ 3-layer system (primitives→semantic→components), Core has defaults, Project overrides primitives only |

### Lessons Learned

1. **Nuxt Layers require auto-imports** - Can't use `~/` paths across layers
2. **SQLite is powerful enough** - Handles millions of rows, thousands of reads/sec
3. **Node.js handles images** - Sharp is faster than Python Pillow
4. **Simpler is better** - One codebase > two separate services
5. **Document decisions** - This brief is essential for fresh starts

---

## 16.1 DX Quick Reference - Common Customizations

**Finding what you need fast:**

### Header Customization

| What | Where | How |
|------|-------|-----|
| **Header width** | `skeleton/header.css` | `--header-max-width: 1400px;` |
| **Header height** | `skeleton/header.css` | `--header-height: 80px;` |
| **Scrolled header height** | `skeleton/header.css` | `--header-scrolled-height: 48px;` |
| **Scrolled background** | `skeleton/header.css` | `--header-scrolled-bg: color-mix(...)` |
| **Enable interactive header** | `puppet-master.config.ts` | `features.interactiveHeader: true` |
| **Hide on scroll down** | `puppet-master.config.ts` | `features.hideHeaderOnScroll: true` |

### Footer Customization

| What | Where | How |
|------|-------|-----|
| **Footer width** | `skeleton/footer.css` | `--footer-max-width: 1200px;` |
| **Footer padding** | `skeleton/footer.css` | `--footer-padding: var(--space-12);` |
| **Rich footer** | HTML | Add class `.footer-rich` |

### Container Widths

| What | Where | How |
|------|-------|-----|
| **Default content width** | `layout/containers.css` | `--content-default: min(1200px, 100% - 2rem);` |
| **Narrow content** | `layout/containers.css` | `--content-narrow: min(720px, 100% - 2rem);` |
| **Wide content** | `layout/containers.css` | `--content-wide: min(1400px, 100% - 2rem);` |
| **Container padding** | `layout/containers.css` | `--container-padding: clamp(1rem, 4vw, 2rem);` |

### Colors

| What | Where | How |
|------|-------|-----|
| **Brand color** | `colors/primitives.css` | `--p-brand: #your-color;` |
| **Accent color** | `colors/primitives.css` | `--p-accent: #your-color;` |
| **Background** | `colors/primitives.css` | `--p-white: #your-bg;` (light mode) |
| **Text** | `colors/primitives.css` | `--p-black: #your-text;` (light mode) |

### Typography

| What | Where | How |
|------|-------|-----|
| **Font family** | `typography/fonts.css` | `--font-sans: 'Your Font', sans-serif;` |
| **Base font size** | `typography/scale.css` | `--text-base: 1rem;` |
| **Heading scale** | `typography/scale.css` | `--text-4xl: clamp(2rem, 5vw, 3rem);` |

### Responsive Breakpoints

Uses `postcss-custom-media` for DRY breakpoints (defined in `layout/breakpoints.css`):

| Breakpoint | Value | Custom Media | Usage |
|------------|-------|--------------|-------|
| Phone | `< 640px` | `--phone` | `@media (--phone) { ... }` |
| Tablet | `≥ 640px` | `--tablet` | `@media (--tablet) { ... }` |
| Desktop | `≥ 1024px` | `--desktop` | `@media (--desktop) { ... }` |
| Large | `≥ 1280px` | `--large` | `@media (--large) { ... }` |
| Below Desktop | `< 1024px` | `--below-desktop` | `@media (--below-desktop) { ... }` |

### Feature Toggles

| Feature | Config Key | Default |
|---------|------------|---------|
| Multi-language | `features.multiLangs` | `true` |
| Theme toggle | `features.doubleTheme` | `true` |
| One-pager mode | `features.onepager` | `false` |
| Admin panel | `features.adminPanel` | `true` |
| Interactive header | `features.interactiveHeader` | `true` |
| Hide header on scroll | `features.hideHeaderOnScroll` | `false` |

---

## 17. Implementation Checklist

### Phase 1: Foundation
- [ ] Create fresh Nuxt 3 project
- [ ] Set up core/ layer structure
- [ ] Configure nuxt.config.ts with extends
- [ ] Add Drizzle + SQLite
- [ ] Create database schema
- [ ] Add @nuxtjs/i18n
- [ ] Add @nuxtjs/color-mode
- [ ] Add Pinia (Q25)
- [ ] Add unplugin-icons + Tabler (Q23)
- [ ] Add vite-svg-loader (Q23)
- [ ] Add Zod (Q24)

### Phase 2: Core CSS System (Q22-Q34)
- [ ] Create main.css entry point with @layer order (Q34)
- [ ] Create reset.css
- [ ] Create colors/ folder (Q22):
  - [ ] index.css (primitives + mode toggle)
  - [ ] auto.css (OKLCH, color-mix, light-dark)
  - [ ] manual.css (brandbook template)
- [ ] Create common/ folder:
  - [ ] index.css
  - [ ] spacing.css (spacing variables)
  - [ ] utilities.css (helper classes)
  - [ ] edge-cases.css (Q27 browser fixes)
- [ ] Create typography/ folder (Q29, Q32):
  - [ ] index.css
  - [ ] variables.css (font stacks, sizes)
  - [ ] base.css (body, headings styling)
  - [ ] fonts/ (self-hosted font files)
- [ ] Create layout/ folder (Q31):
  - [ ] index.css
  - [ ] grid.css (CSS Grid system)
  - [ ] containers.css (container definitions)
  - [ ] responsive.css (portrait/landscape)
- [ ] Create animations/ folder (Q30):
  - [ ] index.css
  - [ ] keyframes.css
  - [ ] transitions.css (Vue transitions)
  - [ ] reduced-motion.css (accessibility)
- [ ] Create skeleton/ folder:
  - [ ] index.css
  - [ ] header.css, footer.css, nav.css, mobile-nav.css, admin.css
- [ ] Create ui/ folder (Q33):
  - [ ] forms/ (inputs, buttons, selects, checkboxes, etc.)
  - [ ] overlays/ (modal, drawer, tooltip, toast)
  - [ ] content/ (card, badge, avatar, tables, lists, etc.)

### Phase 3: Core Components (Atomic Design)
- [ ] **Atoms:**
  - [ ] Logo.vue (universal, variant prop)
  - [ ] NavLink.vue (SPA or one-pager link)
  - [ ] HamburgerIcon.vue (just the button)
  - [ ] ThemeToggle.vue
  - [ ] LangSwitcher.vue
  - [ ] CtaButton.vue
  - [ ] SocialIcon.vue
- [ ] **Molecules:**
  - [ ] NavLinks.vue (list of NavLink)
  - [ ] SocialLinks.vue (list of SocialIcon)
  - [ ] HeaderActions.vue (Theme + Lang + extras)
  - [ ] LegalInfo.vue (OOO, INN, OGRN)
- [ ] **Organisms:**
  - [ ] DesktopHeader.vue
  - [ ] MobileHeader.vue
  - [ ] MobileNav.vue (slide-out panel)
  - [ ] TheFooter.vue
  - [ ] AdminSidebar.vue
  - [ ] AdminHeader.vue
- [ ] **Templates:**
  - [ ] TheHeader.vue (smart desktop/mobile switcher)
- [ ] **Layouts:**
  - [ ] default.vue (TheHeader + slot + TheFooter)
  - [ ] admin.vue (AdminHeader + AdminSidebar + slot)
  - [ ] blank.vue (just slot)
- [ ] **Composables:**
  - [ ] useMediaQuery.ts (reactive CSS media query)

### Phase 4: Backend
- [ ] Auth API (login, logout, session)
- [ ] Settings API (get, update)
- [ ] Upload API (image processing)
- [ ] Server middleware (auth protection)

### Phase 5: Admin Panel
- [ ] Admin dashboard page
- [ ] Settings page
- [ ] Portfolio management page

### Phase 6: Project Template
- [ ] Sample index.vue (renders sections)
- [ ] Sample sections (Hero, About, Portfolio, Contact)
- [ ] Sample admin pages (if adminPanel: true)
- [ ] Project CSS template (color overrides)

### Phase 7: Deployment (Q21)
- [ ] Create Dockerfile
- [ ] Create config/deploy.yml (Kamal config)
- [ ] Add npm script wrappers (deploy, rollback, logs, shell)
- [ ] Set up container registry (ghcr.io or Docker Hub)
- [ ] Configure VPS with Docker

---

## 18. File Templates

### Minimal app.vue

```vue
<template>
  <div :dir="isRtl ? 'rtl' : 'ltr'" :class="colorMode.value">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const colorMode = useColorMode()
const isRtl = computed(() => isRtlLanguage(locale.value))
</script>
```

### Minimal default.vue Layout

```vue
<template>
  <div class="layout">
    <SkeletonHeader />
    <main>
      <slot />
    </main>
    <SkeletonFooter />
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
</style>
```

### Minimal Header.vue

```vue
<template>
  <header class="header">
    <div class="header__container">
      <SkeletonLogo />
      <SkeletonNav v-if="!isMobile" />
      <SkeletonMenusSection />
      <SkeletonHamburger v-if="isMobile" />
    </div>
  </header>
</template>

<script setup>
const isMobile = useMediaQuery('(max-width: 768px)')
</script>
```

---

## 19. Component Architecture (Atomic Design)

### The Problem with Current Structure

The current skeleton has coupling issues:
1. **Hamburger contains Nav** - Weird, Nav rendered inside Hamburger.vue
2. **Logo duplicated** - Footer has inline `<NuxtImg>` instead of using Logo.vue
3. **CSS-only switching** - Renders all DOM, hides with CSS
4. **Nav too coupled** - Links.vue has all logic, Nav.vue is just wrapper

### New Architecture: Atoms → Molecules → Organisms

```
core/components/
├── atoms/                    # Smallest reusable pieces
│   ├── Logo.vue              # Universal logo (header, footer, mobile)
│   ├── NavLink.vue           # Single nav link (SPA or one-pager)
│   ├── ThemeToggle.vue       # Light/dark toggle
│   ├── LangSwitcher.vue      # Language switcher
│   ├── HamburgerIcon.vue     # Just the hamburger button
│   ├── CtaButton.vue         # Call-to-action button
│   └── SocialIcon.vue        # Single social link with icon
│
├── molecules/                # Composed atoms
│   ├── NavLinks.vue          # List of NavLink from routes
│   ├── SocialLinks.vue       # List of SocialIcon from CMS
│   ├── HeaderActions.vue     # ThemeToggle + LangSwitcher + Contacts
│   └── LegalInfo.vue         # OOO, INN, OGRN block
│
├── organisms/                # Complete sections
│   ├── DesktopHeader.vue     # Full desktop header
│   ├── MobileHeader.vue      # Simplified mobile header
│   ├── MobileNav.vue         # Slide-out navigation panel
│   ├── TheFooter.vue         # Complete footer
│   ├── AdminSidebar.vue      # Admin sidebar
│   └── AdminHeader.vue       # Admin top bar
│
└── templates/                # Smart switchers
    └── TheHeader.vue         # Renders Desktop OR Mobile
```

### Atoms Specification

#### Logo.vue
```vue
<script setup>
defineProps<{
  variant?: 'header' | 'footer' | 'mobile' | 'admin'
  size?: 'sm' | 'md' | 'lg'
}>()

const { locale } = useI18n()
const colorMode = useColorMode()
</script>

<template>
  <NuxtLink to="/" class="logo" :class="[variant, size]">
    <NuxtImg
      :src="`images/logos/logo-for-${colorMode.preference}-${locale}.svg`"
      :alt="$t('common.name')"
    />
  </NuxtLink>
</template>
```

#### NavLink.vue
```vue
<script setup>
const props = defineProps<{
  to: string
  label: string
  isOnepager?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

// One-pager: scroll to section, SPA: navigate
const handleClick = () => emit('click')
</script>

<template>
  <NuxtLink v-if="!isOnepager" :to="to" @click="handleClick">
    {{ label }}
  </NuxtLink>
  <a v-else :href="`#${to}`" @click="handleClick">
    {{ label }}
  </a>
</template>
```

#### HamburgerIcon.vue
```vue
<script setup>
defineProps<{ isActive: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    class="hamburger hamburger--spring"
    :class="{ 'is-active': isActive }"
    @click="$emit('toggle')"
    aria-label="Menu"
  >
    <span class="hamburger-box">
      <span class="hamburger-inner" />
    </span>
  </button>
</template>
```

### Molecules Specification

#### NavLinks.vue
```vue
<script setup>
const { onepager, routes } = useConfig()
const emit = defineEmits<{ navigate: [] }>()

// Route labels from i18n
const navItems = computed(() => routes.value.map((route, i) => ({
  to: route,
  label: $t(`nav.${i}`)  // nav.0, nav.1, etc.
})))
</script>

<template>
  <nav class="nav-links">
    <NavLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :is-onepager="onepager"
      @click="emit('navigate')"
    />
  </nav>
</template>
```

#### HeaderActions.vue
```vue
<script setup>
const { multiLangs, doubleTheme } = useConfig()
</script>

<template>
  <div class="header-actions">
    <LangSwitcher v-if="multiLangs" />
    <ThemeToggle v-if="doubleTheme" />
    <slot /> <!-- For additional items -->
  </div>
</template>
```

### Organisms Specification

#### DesktopHeader.vue
```vue
<template>
  <header class="header header--desktop">
    <Logo variant="header" />
    <NavLinks />
    <HeaderActions />
    <CtaButton />
  </header>
</template>
```

#### MobileHeader.vue
```vue
<script setup>
defineProps<{ menuOpen: boolean }>()
defineEmits<{ 'toggle-menu': [] }>()
</script>

<template>
  <header class="header header--mobile">
    <HamburgerIcon :is-active="menuOpen" @toggle="$emit('toggle-menu')" />
    <Logo variant="mobile" size="sm" />
    <CtaButton variant="icon" />
  </header>
</template>
```

#### MobileNav.vue
```vue
<script setup>
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const close = () => emit('update:open', false)
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="open" class="mobile-nav-backdrop" @click="close" />
    </Transition>

    <!-- Panel -->
    <Transition name="slide-right">
      <aside v-if="open" class="mobile-nav">
        <NavLinks @navigate="close" />
        <HeaderActions />
        <SocialLinks />
      </aside>
    </Transition>
  </Teleport>
</template>
```

### Templates Specification

#### TheHeader.vue (Smart Switcher)
```vue
<script setup>
// Use CSS media query reactively
// 2025 approach: width-based breakpoints for reliable behavior
const isDesktop = useMediaQuery('(min-width: 1024px)')
const menuOpen = ref(false)

// Close menu on route change
const route = useRoute()
watch(() => route.path, () => menuOpen.value = false)

// Close menu when switching to landscape
watch(isDesktop, (desktop) => {
  if (desktop) menuOpen.value = false
})
</script>

<template>
  <DesktopHeader v-if="isDesktop" />
  <template v-else>
    <MobileHeader
      :menu-open="menuOpen"
      @toggle-menu="menuOpen = !menuOpen"
    />
    <MobileNav v-model:open="menuOpen" />
  </template>
</template>
```

### Benefits of This Architecture

| Aspect | Before | After |
|--------|--------|-------|
| **Logo reuse** | Duplicated in Footer | One component everywhere |
| **Mobile nav** | Inside Hamburger.vue | Independent MobileNav.vue |
| **Hamburger** | Contains nav logic | Just an icon button |
| **DOM rendering** | All elements, CSS hides | Only renders needed |
| **Customization** | Override whole header | Override specific atom |
| **Testing** | Hard to test | Each atom testable |
| **Mobile/Desktop** | Same component, CSS | Different components |

### Component Dependency Graph

```
TheHeader.vue
├── DesktopHeader.vue
│   ├── Logo.vue
│   ├── NavLinks.vue
│   │   └── NavLink.vue (×N)
│   ├── HeaderActions.vue
│   │   ├── LangSwitcher.vue
│   │   └── ThemeToggle.vue
│   └── CtaButton.vue
│
├── MobileHeader.vue
│   ├── HamburgerIcon.vue
│   ├── Logo.vue
│   └── CtaButton.vue
│
└── MobileNav.vue
    ├── NavLinks.vue
    ├── HeaderActions.vue
    └── SocialLinks.vue
        └── SocialIcon.vue (×N)

TheFooter.vue
├── Logo.vue
├── NavLinks.vue
├── SocialLinks.vue
├── LegalInfo.vue
└── CtaButton.vue
```

---

## Ready to Build! 🚀

This document contains everything needed to build Puppet Master 2.0 from scratch with:

- ✅ Clear goals and use cases (Section 1)
- ✅ Complete tech stack decisions (Section 2)
- ✅ Architecture & folder structure (Sections 3-4)
- ✅ Database schema (Section 7)
- ✅ CSS architecture with Q22 OKLCH color system (Section 8)
- ✅ Icons, Forms, State, Animation, Edge Cases (Sections 8.1-8.5)
- ✅ Configuration system (Section 9)
- ✅ Authentication approach (Section 11)
- ✅ All 27 architectural decisions documented (Section 16)
- ✅ Implementation checklist with phases (Section 17)
- ✅ Component Architecture - Atomic Design (Section 19)
- ✅ Logo System with theme/language variants (Section 20)

**Next step:** Create fresh Nuxt 3 project and implement Phase 1.

---

## 20. Logo System

### Overview

The logo system automatically selects the correct logo variant based on:
1. **Current theme** (light/dark mode)
2. **Current language** (en/ru/he/etc.)
3. **Fallback chain** if variant doesn't exist

### File Naming Convention

```
/public/logos/{shape}_{theme}_{lang}.svg
```

| Component | Options | Description |
|-----------|---------|-------------|
| **shape** | `horizontal`, `circle` | Horizontal for header, circle for mobile/footer |
| **theme** | `dark`, `light` | `dark` = dark text (for light bg), `light` = light text (for dark bg) |
| **lang** | `en`, `ru`, `he`, etc. | Language-specific version |

### Examples

```
/public/logos/
├── horizontal_dark_en.svg   # Header logo, dark text, English
├── horizontal_dark_ru.svg   # Header logo, dark text, Russian
├── horizontal_light_en.svg  # Header logo, light text, English
├── horizontal_light_ru.svg  # Header logo, light text, Russian
├── circle_dark_en.svg       # Circle logo, dark, English
├── circle_dark_ru.svg       # Circle logo, dark, Russian
├── circle_light_en.svg      # Circle logo, light, English
└── circle_light_ru.svg      # Circle logo, light, Russian
```

### Configuration (Developer-Controlled)

```typescript
// puppet-master.config.ts
logo: {
  basePath: '/logos',

  shapes: {
    horizontal: 'header',  // Used in desktop header
    circle: 'mobile'       // Used in mobile header and footer
  },

  // Fallback chain for languages without their own logo
  langFallback: {
    he: 'en',  // Hebrew uses English logo
    ar: 'en',  // Arabic uses English logo
  },

  // Available logo files
  available: [
    'horizontal_dark_en',
    'horizontal_dark_ru',
    // ... etc
  ]
}
```

### Usage (Composable)

```typescript
// In your component
const { headerLogo, mobileLogo, getLogoSrc } = useLogo()

// headerLogo and mobileLogo are reactive computed refs
// They automatically update when theme or language changes
```

```vue
<template>
  <img :src="headerLogo" alt="Logo" />
</template>
```

### How Theme Mapping Works

**Important:** The logo theme is INVERTED from the UI theme:
- **Dark mode UI** → Uses `light` logo (white/light colored text)
- **Light mode UI** → Uses `dark` logo (black/dark colored text)

### Adding a New Language Logo

1. Create the logo files with correct naming:
   - `horizontal_dark_he.svg`
   - `horizontal_light_he.svg`
   - `circle_dark_he.svg`
   - `circle_light_he.svg`

2. Add to config `available` array:
   ```typescript
   available: [
     // ... existing
     'horizontal_dark_he',
     'horizontal_light_he',
     'circle_dark_he',
     'circle_light_he'
   ]
   ```

3. Remove from `langFallback` (if was using fallback):
   ```typescript
   langFallback: {
     // he: 'en',  // Remove this line
   }
   ```

### Fallback Chain

If a logo variant doesn't exist:
1. Check `langFallback` config
2. Fall back to English (`en`)
3. Ultimate fallback: `horizontal_dark_en.svg`

---

## 21. Role-Based Access Control (RBAC)

### Three-Tier Role System

| Role | Level | Description | Access |
|------|-------|-------------|--------|
| **Master** | 2 | Developer/agency who builds the site | Full access to everything |
| **Admin** | 1 | Client who owns the site | Manages content + users (except master) |
| **Editor** | 0 | Client's employees | Content only |

### Permission Matrix

| Feature | Master | Admin | Editor |
|---------|--------|-------|--------|
| View Dashboard | ✅ | ✅ | ✅ |
| Edit Settings | ✅ | ✅ | ❌ |
| Manage Portfolio | ✅ | ✅ | ✅ |
| View Contacts | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ (not master) | ❌ |
| Manage Translations | ✅ | ✅ | ❌ |
| Health Monitoring | ✅ | ❌ | ❌ |

### Implementation

```typescript
// server/utils/auth.ts
export function requireRole(event: H3Event, minRole: 'editor' | 'admin' | 'master') {
  const session = getSession(event)
  const roleLevel = { editor: 0, admin: 1, master: 2 }

  if (roleLevel[session.role] < roleLevel[minRole]) {
    throw createError({ statusCode: 403, message: 'Insufficient permissions' })
  }
}

// Usage in API endpoint
export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')  // Only admin+ can access
  // ...
})
```

---

## 22. Testing Framework

### Vitest Setup

| Component | Status |
|-----------|--------|
| Vitest | ✅ Configured |
| Test Files | 7 files |
| Total Tests | 88 tests |
| Coverage | All passing |

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Auth | 15 | Login, logout, session, password hashing |
| Settings | 12 | CRUD operations, validation |
| Portfolio | 18 | CRUD, ordering, publishing |
| Contacts | 14 | Submissions, read/unread, deletion |
| Users | 16 | CRUD, role validation, password changes |
| Translations | 8 | CRUD, locale handling |
| Utils | 5 | Helper functions |

### Running Tests

```bash
# Run all tests
npm run test:run

# Watch mode
npm run test

# With coverage
npm run test:coverage
```

---

## 23. i18n Architecture

### Two-Layer Translation System

| Layer | Source | Purpose |
|-------|--------|---------|
| **System Translations** | `i18n/system.ts` | UI strings (nav, buttons, labels) |
| **Content Translations** | Database | User-editable content |

### System Translations Structure

```typescript
// i18n/system.ts
export const systemTranslations: Record<string, Record<string, any>> = {
  en: {
    nav: { home: 'Home', about: 'About', ... },
    common: { save: 'Save', cancel: 'Cancel', ... },
    admin: { title: 'Admin Panel', ... },
    auth: { login: 'Login', logout: 'Logout', ... },
  },
  ru: { ... },
  he: { ... }
}

// CRITICAL: Return nested objects, NOT flattened!
export function getSystemTranslations(locale: string): Record<string, any> {
  return systemTranslations[locale] ?? systemTranslations['en'] ?? {}
}
```

### Why Nested Objects?

Vue I18n expects nested objects for dot-notation keys:

```typescript
// ❌ WRONG - Vue I18n can't find 'admin.title'
{ 'admin.title': 'Admin Panel' }

// ✅ CORRECT - Vue I18n finds t('admin.title')
{ admin: { title: 'Admin Panel' } }
```

---

## 24. Hydration Best Practices

### The Golden Rule

> **Never nest block elements inside `<p>` tags when using slots.**

### The Problem

```vue
<!-- SectionAbout.vue - WRONG -->
<p class="text-lg">
  <slot>{{ content }}</slot>
</p>

<!-- index.vue -->
<SectionAbout>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</SectionAbout>
```

This causes hydration mismatch because:
1. `<p>` inside `<p>` is invalid HTML
2. Browser auto-closes the outer `<p>` during SSR
3. Client-side Vue expects the original structure
4. DOM mismatch = hydration error

### The Solution

```vue
<!-- SectionAbout.vue - CORRECT -->
<div class="text-lg text-secondary">
  <slot>
    <p>{{ content }}</p>
  </slot>
</div>
```

### Hydration Checklist

| Rule | Description |
|------|-------------|
| ✅ Use `<div>` for slot containers | When slot may contain block elements |
| ✅ Check HTML validity | No `<p>` inside `<p>`, `<a>` inside `<a>`, etc. |
| ✅ Avoid client-only content in SSR | Use `<ClientOnly>` wrapper if needed |
| ✅ Match server/client state | Ensure reactive data is consistent |

---

## 25. Storage System

### Dual Storage Strategy

| Mode | Use Case | Configuration |
|------|----------|---------------|
| **Local** | Development, small sites | `STORAGE_TYPE=local` |
| **S3** | Production, scalable | `STORAGE_TYPE=s3` |

### Environment Variables

```env
# Local storage (default)
STORAGE_TYPE=local
UPLOAD_DIR=./uploads

# S3 storage
STORAGE_TYPE=s3
S3_BUCKET=my-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

### Storage Composable

```typescript
// server/utils/storage.ts
export async function uploadFile(file: Buffer, filename: string): Promise<string> {
  if (process.env.STORAGE_TYPE === 's3') {
    return uploadToS3(file, filename)
  }
  return uploadToLocal(file, filename)
}
```

---

## 26. Contact Form & Notifications

### Telegram Integration

Optional Telegram notifications for new contact form submissions:

```typescript
// puppet-master.config.ts
features: {
  contactTelegramNotify: true  // Enable Telegram notifications
}

// .env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Implementation

```typescript
// server/api/contact/submit.post.ts
if (config.features.contactTelegramNotify) {
  // Fire-and-forget (non-blocking)
  notifyNewContact(submission).catch(console.error)
}
```

### Unread Message Badge

Admin nav shows unread message count:

```typescript
// composables/useUnreadCount.ts
export function useUnreadCount() {
  const count = useState<number>('unreadCount', () => 0)

  async function refresh() {
    const { data } = await useFetch('/api/admin/contacts/unread')
    count.value = data.value?.count ?? 0
  }

  return { count, refresh }
}
```
