# Puppet Master - Developer Usage Guide

## Overview

Puppet Master is a studio toolkit for creating landing pages and portfolio sites. This guide explains the developer workflow for creating new client sites.

---

## Translation Architecture

### Two Sources of Truth

| Source      | Location         | Editable by Client | Purpose                            |
| ----------- | ---------------- | ------------------ | ---------------------------------- |
| **SYSTEM**  | `i18n/system.ts` | ❌ Never           | UI labels, navigation, admin panel |
| **CONTENT** | Database         | ✅ Via Admin Panel | Section content, SEO, CTAs         |

### System Translations (Developer-only)

Located in `i18n/system.ts`. These are:

- Version controlled in git
- Shared across all Puppet Master sites
- Cannot be broken by client
- NOT visible in Admin Panel

**Prefixes:**

- `common.*` - Shared UI (loading, save, cancel)
- `nav.*` - Navigation labels
- `auth.*` - Login/logout
- `admin.*` - Admin panel UI
- `theme.*` - Theme switcher
- `footer.*` - Footer system text
- `validation.*` - Form validation

### Content Translations (Client-editable)

Located in `i18n/content.ts` (defaults) → Database (runtime).

**Prefixes:**

- `hero.*` - Hero section
- `about.*` - About section
- `portfolio.*` - Portfolio section
- `services.*` - Services section
- `contact.*` - Contact form
- `seo.*` - SEO meta content
- `cta.*` - Call-to-action buttons

---

## Developer Workflow: Creating a New Client Site

### Step 1: Define Sections in Config

Edit `app/puppet-master.config.ts`:

```typescript
sections: [
  { id: 'home', inNav: true },
  { id: 'about', inNav: true },
  { id: 'portfolio', inNav: true },
  { id: 'contact', inNav: true }
  // Add new sections here
]
```

### Step 2: Add Navigation Labels (System)

Edit `i18n/system.ts` - add labels for each section:

```typescript
nav: {
  home: 'Home',
  about: 'About',
  portfolio: 'Portfolio',
  contact: 'Contact',
  // Add new nav labels here
}
```

### Step 3: Create Section Component

Create `app/components/sections/SectionNewSection.vue`:

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section id="newsection" class="section">
    <div class="container">
      <h2 class="section-title">{{ t('newsection.title') }}</h2>
      <p>{{ t('newsection.description') }}</p>
    </div>
  </section>
</template>
```

**Key:** Use `t('section.key')` - INVENT keys based on content structure.

### Step 4: Add Default Content (Content)

Edit `i18n/content.ts`:

```typescript
en: {
  newsection: {
    title: 'New Section Title',
    description: 'Default description text...'
  }
},
ru: {
  newsection: {
    title: 'Заголовок нового раздела',
    description: 'Текст описания по умолчанию...'
  }
}
```

### Step 5: Seed the Database

```bash
npm run db:seed
```

This populates the database with default content. Existing values are preserved.

### Step 6: Client Edits via Admin Panel

Client logs into `/admin` and edits content in **Translations** page.
They can ONLY see content keys (hero._, about._, etc.).
System keys (nav._, admin._, etc.) are hidden and protected.

---

## Key Concepts

### Config-Driven Architecture

`puppet-master.config.ts` is the single source of truth:

- Sections → Navigation is auto-generated
- Locales → Language switcher is auto-generated
- Features → Enable/disable onepager mode, etc.

### CSS System

**NEVER use scoped styles in components!**

Use the skeleton CSS system with global classes:

- `.section`, `.container`, `.card`
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.input`, `.form-group`, `.form-label`

Scoped styles are ONLY allowed for custom sections on client sites with heavy custom graphics.

### Logo System

- `shortLogo` - Compact circle/icon logo (sidebar, footer, hero)
- `headerLogo` - Full horizontal logo (header)

Use `useLogo()` composable to access logos.

---

## Commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start development server           |
| `npm run db:seed`  | Seed database with defaults        |
| `npm run db:reset` | Reset database (deletes all data!) |
| `npm run build`    | Build for production               |

---

## File Structure

```
app/
├── app/
│   ├── puppet-master.config.ts  # Main config
│   ├── components/
│   │   ├── sections/            # Page sections
│   │   ├── molecules/           # Reusable components
│   │   └── atoms/               # Basic elements
│   └── pages/
│       └── admin/               # Admin panel pages
├── i18n/
│   ├── system.ts                # System translations (dev-only)
│   ├── content.ts               # Content defaults (client-editable)
│   └── loader.ts                # Merges system + database
├── server/
│   ├── api/                     # API endpoints
│   └── database/
│       ├── schema.ts            # Database schema
│       └── seed.ts              # Seed script
└── data/
    └── sqlite.db                # SQLite database
```
