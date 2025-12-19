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
.footer { padding: 1rem; }
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

| Component | File Location |
|-----------|---------------|
| Admin sidebar | `layout/admin-sidebar.css` |
| Admin header | `layout/admin-header.css` |
| Icon sizes | `common/icons.css` |
| Text utilities | `common/text.css` |
| Tab component | `ui/content/tabs.css` |

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

### 5. CSS Layers
Use `@layer` for cascade control:
```css
@layer reset, primitives, semantic, components, utilities;
```

| Layer | Purpose |
|-------|---------|
| `reset` | Browser normalize |
| `primitives` | Raw tokens (colors, fonts) |
| `semantic` | Calculated values |
| `components` | UI styling |
| `utilities` | Override helpers (highest priority) |

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

| Use Case | Unit | Example |
|----------|------|---------|
| Fixed Spacing | `rem` | `max-width: 62.5rem` |
| Fluid Typography | `clamp()` | `font-size: clamp(1rem, 1rem + 1vw, 1.5rem)` |
| Borders | `px` | `border: 1px solid` |
| Viewport Heights | `dvh` | `height: 100dvh` |
| Line Height | unitless | `line-height: 1.5` |
| CSS Variables | tokens | `padding: var(--space-4)` |

---

## Translations

Two sources of truth:

| Type | Source | Editable by Client |
|------|--------|-------------------|
| **SYSTEM** | `i18n/system.ts` | ❌ Never |
| **CONTENT** | Database | ✅ Via Admin Panel |

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

| Layer | Defined By | Entered By |
|-------|------------|------------|
| Structure/Schema | Developer | - |
| Behavior/Features | Developer | - |
| Content/Values | - | Client via Admin |

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

| Mode | Website | App/Admin |
|------|---------|-----------|
| `app-only` | ❌ | ✅ App (vertical sidebar) |
| `website-app` | ✅ (hamburger) | ✅ App (login button visible) |
| `website-admin` | ✅ (hamburger) | ✅ Admin (hidden at /admin) |
| `website-only` | ✅ (hamburger) | ❌ |

### Website Sub-Modes

| Mode | Navigation |
|------|------------|
| Onepager | Scroll-based anchors (`#about`, `#contact`) |
| SPA | Route-based (`/about`, `/contact`) |

**Important:** Admin panel is ALWAYS app visual mode (vertical sidebar), regardless of application mode.

---

## Code Review Mindset

When analyzing code, act like a senior dev:
- Flag redundancy as PROBLEMS
- Flag over-engineering as PROBLEMS
- Flag duplicate implementations as PROBLEMS
- Once a decision is made, document it and don't revisit as open discussion
