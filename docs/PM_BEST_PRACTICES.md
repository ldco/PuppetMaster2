# 🎭 Puppet Master - Best Practices

Quick reference for development standards and conventions.

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
color: var(--t-muted);
```

### 3. CSS Organization by Domain
CSS files are organized by **domain/purpose**, not atomic level:
- `colors/` - Color variables, themes
- `typography/` - Font families, sizes
- `layout/` - Grid, containers
- `skeleton/` - Header, footer, nav
- `ui/` - Forms, buttons, overlays

### 4. CSS Layers
Use `@layer` for cascade control:
```css
@layer primitives { /* Raw values */ }
@layer semantic { /* Calculated values */ }
@layer components { /* UI styling */ }
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

| Use Case | Unit |
|----------|------|
| Fluid Typography | `clamp(rem, rem+vw, rem)` |
| Fluid Spacing | `clamp()` |
| Fixed Spacing | `rem` |
| Borders | `px` |
| Viewport Heights | `dvh` or `vh` |
| Line Height | unitless |

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
---

## File Organization

- Prefer organizing code into folders with separate files for each utility/type
- Don't consolidate everything into a single file
- Keep related code close together

---

## Code Review Mindset

When analyzing code, act like a senior dev:
- Flag redundancy as PROBLEMS
- Flag over-engineering as PROBLEMS
- Flag duplicate implementations as PROBLEMS
- Once a decision is made, document it and don't revisit as open discussion

