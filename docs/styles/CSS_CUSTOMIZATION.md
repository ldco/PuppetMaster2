# 🎨 CSS Customization Guide

How to customize PuppetMaster styles for client projects.

---

## Quick Start: Brand Colors

The fastest way to customize for a new client is to update the 4 base colors:

```css
/* assets/css/colors/primitives.css */
:root {
  --c-black: oklch(from #2f2f2f l c h);   /* Dark color */
  --c-white: oklch(from #f0f0f0 l c h);   /* Light color */
  --c-brand: oklch(from #aa0000 l c h);   /* Primary brand */
  --c-accent: oklch(from #6366f1 l c h);  /* Secondary accent */
}
```

All other colors are auto-calculated from these 4 values using `color-mix()` and `light-dark()`.

---

## Common Customizations

### 1. Header Height

```css
/* assets/css/skeleton/header.css */
:root {
  --header-height: 80px;
  --header-scrolled-height: 60px;
}
```

### 2. Sidebar Width

```css
/* assets/css/layout/admin-sidebar.css */
:root {
  --admin-sidebar-width: 240px;
  --admin-sidebar-collapsed-width: 64px;
}
```

### 3. Container Width

```css
/* assets/css/layout/containers.css */
:root {
  --content-default: min(1280px, 100%);
  --content-narrow: min(768px, 100%);
  --content-wide: min(1536px, 100%);
}
```

### 4. Typography

```css
/* assets/css/typography/variables.css */
:root {
  /* Body text */
  --font-sans: 'ClientFont', system-ui, sans-serif;
  /* Headings, decorative (optional - defaults to --font-sans) */
  --font-accent: 'ClientDisplayFont', serif;
}
```

**Default (PuppetMaster branding):** Montserrat for both `--font-sans` and `--font-accent`.

**For client projects:** Override with client's brand fonts.

### Font Loading Options

**Option 1: Google Fonts** (recommended for common fonts)
```typescript
// nuxt.config.ts
googleFonts: {
  families: {
    'Open Sans': [400, 500, 700],
    'Playfair Display': [700]
  }
}
```

**Option 2: Self-hosted** (for custom brand fonts)
```css
/* assets/css/typography/font-faces.css */
@font-face {
  font-family: 'ClientFont';
  src: url('./fonts/ClientFont-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 5. Border Radius

```css
/* assets/css/common/effects.css */
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-full: 9999px;   /* Pills, avatars */
}
```

---

## File-by-File Reference

| I need to customize... | Edit this file |
|------------------------|----------------|
| Brand colors | `colors/primitives.css` |
| Font family | `typography/variables.css` |
| Self-hosted fonts | `typography/font-faces.css` |
| Header | `skeleton/header.css` |
| Footer | `skeleton/footer.css` |
| App sidebar | `layout/admin-sidebar.css` |
| App bottom nav | `skeleton/bottom-nav.css` |
| Buttons | `ui/forms/buttons.css` |
| Input fields | `ui/forms/inputs.css` |
| Cards | `ui/content/cards.css` |
| Tabs | `ui/content/tabs.css` |
| Modals | `ui/overlays/modal.css` |
| Spacing scale | `common/spacing.css` |

---

## Best Practices

### ✅ DO

1. **Use CSS variables** - Never hardcode values
   ```css
   /* Good */
   padding: var(--space-4);
   ```

2. **Use logical properties** - For RTL support
   ```css
   /* Good */
   margin-inline-start: var(--space-4);
   border-block-end: 1px solid var(--l-border);
   ```

3. **Keep responsive rules in same file** - Base + media queries together
   ```css
   /* Good - in admin-sidebar.css */
   .admin-sidebar { width: 240px; }
   @media (--phone) { .admin-sidebar { display: none; } }
   ```

4. **Use rem units** - For scalability
   ```css
   /* Good */
   max-width: 62.5rem;  /* 1000px */
   ```

### ❌ DON'T

1. **Don't use scoped styles in Vue components**
   ```vue
   <!-- Bad -->
   <style scoped>
   .custom { color: red; }
   </style>
   ```

2. **Don't use magic numbers**
   ```css
   /* Bad */
   width: 280px;
   padding: 16px;
   ```

3. **Don't use physical properties** (for RTL)
   ```css
   /* Bad */
   margin-left: 1rem;
   border-top: 1px solid;
   ```

---

## Adding New Components

When adding a new CSS component:

1. **Create a new file** in the appropriate folder:
   - UI element → `ui/content/my-component.css`
   - Form element → `ui/forms/my-component.css`
   - Overlay → `ui/overlays/my-component.css`

2. **Import in index.css**:
   ```css
   /* ui/content/index.css */
   @import './my-component.css';
   ```

3. **Use design tokens**:
   ```css
   .my-component {
     padding: var(--space-4);
     background: var(--l-surface);
     border-radius: var(--radius-md);
     color: var(--l-text);
   }
   ```

4. **Add responsive rules in same file**:
   ```css
   @media (--phone) {
     .my-component {
       padding: var(--space-2);
     }
   }
   ```

---

## Client-Specific Overrides

For heavy custom styling on client projects:

1. Create `assets/css/client/` folder
2. Add client-specific CSS files
3. Import AFTER main.css in nuxt.config.ts

```typescript
// nuxt.config.ts
css: [
  '~/assets/css/main.css',
  '~/assets/css/client/overrides.css'  // Client-specific
]
```

This keeps the core framework separate from client customizations.

