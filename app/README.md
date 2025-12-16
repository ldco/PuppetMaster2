<p align="center">
  <img src="pm_design/horizontal_dark_en.svg" alt="Puppet Master" width="400" />
</p>

<h1 align="center">Puppet Master</h1>

<p align="center">
  <strong>A modern, secure, and highly customizable landing page & portfolio framework built with Nuxt 4</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## ✨ Features

- 🎨 **Pure CSS Architecture** - No Tailwind, modern CSS with OKLCH colors, `light-dark()`, and CSS layers
- 🌍 **Multi-language Support** - Database-driven i18n with RTL auto-detection
- 🌓 **Theme System** - Light/dark mode with automatic theme-aware logos
- 📱 **Mobile-First Responsive** - Modern breakpoints with container queries
- ⚡ **Interactive Header** - Scroll-based header style changes with glassmorphism
- 🔐 **Secure by Design** - SQLite database, server-side rendering
- 🎭 **One-pager Mode** - Toggle between scroll-based or route-based navigation
- 📝 **CMS Admin Panel** - Built-in content management (optional)
- 🎯 **DX-Focused** - Comprehensive documentation, well-commented code

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Nuxt 4 (Vue 3, TypeScript) |
| **Styling** | Pure CSS (OKLCH, light-dark(), CSS layers) |
| **Database** | SQLite + Drizzle ORM |
| **State** | Pinia |
| **i18n** | @nuxtjs/i18n (database-driven) |
| **Icons** | unplugin-icons (any icon set) |
| **Font** | Montserrat (Google Fonts) |
| **Deployment** | Docker + Kamal |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/puppet-master.git
cd puppet-master

# Install dependencies
cd app
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## ⚙️ Configuration

All configuration is centralized in `app/puppet-master.config.ts`:

```typescript
export default {
  features: {
    multiLangs: true,        // Multi-language support
    doubleTheme: true,       // Light/dark mode
    onepager: true,          // One-pager vs SPA mode
    adminPanel: true,        // Admin CMS panel
    interactiveHeader: true, // Scroll-based header effects
  },
  
  locales: [
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'ru', iso: 'ru-RU', name: 'Русский' },
    { code: 'he', iso: 'he-IL', name: 'עברית' }
  ],
  
  logo: {
    basePath: '/logos',
    langFallback: { he: 'en' }, // Hebrew uses English logo
  },
  
  colors: {
    black: '#2f2f2f',   // From logo
    white: '#f0f0f0',   // From logo
    brand: '#aa0000',   // From logo
    accent: '#0f172a',
  }
}
```

## 📖 Documentation

See [PUPPET-MASTER-TECHNICAL-BRIEF.md](./PUPPET-MASTER-TECHNICAL-BRIEF.md) for comprehensive documentation including:

- Architecture decisions
- CSS system details
- Database schema
- Component patterns
- DX quick reference for common customizations

### Quick Customization Reference

| What | Where |
|------|-------|
| **Header width** | `skeleton/header.css` → `--header-max-width` |
| **Footer padding** | `skeleton/footer.css` → `--footer-padding` |
| **Brand colors** | `colors/primitives.css` → `--p-brand` |
| **Default font** | `typography/variables.css` → `--font-sans` |
| **Container width** | `layout/containers.css` → `--content-default` |

## 📁 Project Structure

```
puppet-master/
├── app/                    # Nuxt application
│   ├── app/
│   │   ├── assets/css/     # Pure CSS system
│   │   ├── components/     # Vue components (Atomic Design)
│   │   ├── composables/    # Vue composables
│   │   ├── layouts/        # Page layouts
│   │   └── puppet-master.config.ts
│   ├── server/             # API routes, database
│   └── public/             # Static assets, logos
├── pm_design/              # Logo design files
└── PUPPET-MASTER-TECHNICAL-BRIEF.md
```

## 🎨 Logo System

Logos automatically switch based on theme and language:

```
/public/logos/{shape}_{theme}_{lang}.svg

Examples:
- horizontal_dark_en.svg  → Light mode, English
- horizontal_light_ru.svg → Dark mode, Russian
```

## 📄 License

MIT

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/your-username">Your Name</a>
</p>

