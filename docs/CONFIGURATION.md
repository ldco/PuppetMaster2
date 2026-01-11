# Configuration Reference

Complete reference for all Puppet Master configuration options.

## Configuration Files Overview

| File | Purpose | When Applied |
|------|---------|--------------|
| `puppet-master.config.ts` | Build-time config (modes, features, structure) | Rebuild required |
| `.env` | Runtime secrets (database, SMTP, API keys) | Server restart |
| `nuxt.config.ts` | Nuxt modules and build settings | Rebuild required |

---

## Main Configuration

Located at `app/puppet-master.config.ts`. This is the central configuration file.

### PM Mode (Setup State)

The `pmMode` field controls the project's setup state and determines behavior.

```typescript
pmMode: 'unconfigured' | 'build' | 'develop'
```

| pmMode | Description | What Happens |
|--------|-------------|--------------|
| `'unconfigured'` | Fresh clone, needs setup | Wizard at `/setup` |
| `'build'` | Client project (website or app) | Normal site operation |
| `'develop'` | Framework development | Shows showcase site |

**This is set by the setup wizard.** You typically don't edit this manually.

---

### Project Type (BUILD mode only)

When `pmMode` is `'build'`, you also specify the project type:

```typescript
projectType: 'website' | 'app'
```

| Type | Description | UX Pattern |
|------|-------------|------------|
| `'website'` | Marketing site, landing pages | Horizontal header |
| `'app'` | Dashboard, user features | Sidebar/bottom nav |

---

### Admin Panel

Enable or disable the admin panel:

```typescript
admin: {
  enabled: true
}
```

When enabled, admin routes are available at `/admin/*`.

---

### Legacy Application Modes (Deprecated)

> **Note:** The old `mode` field with values like `app-only`, `website-app`, etc. is being replaced by the combination of `pmMode`, `projectType`, and `admin.enabled`.

For reference, the mapping is:

| Old Mode | New Configuration |
|----------|-------------------|
| `app-only` | `projectType: 'app'`, `admin.enabled: false` |
| `website-app` | `projectType: 'website'`, login button visible |
| `website-admin` | `projectType: 'website'`, `admin.enabled: true`, login hidden |
| `website-only` | `projectType: 'website'`, `admin.enabled: false` |

---

### Feature Toggles

Fine-tune behavior within the chosen mode.

```typescript
features: {
  // Website features
  multiLangs: true,           // Multiple language support
  doubleTheme: true,          // Light/dark mode toggle
  onepager: true,             // Scroll navigation vs route-based
  interactiveHeader: true,    // Header changes style on scroll
  hideHeaderOnScroll: false,  // Auto-hide header when scrolling down
  verticalNav: false,         // Icon sidebar vs horizontal header

  // Admin features
  appVerticalNav: true,       // Admin panel: sidebar vs horizontal

  // PWA
  pwa: false,                 // Progressive Web App support

  // Contact form notifications (requires .env)
  contactEmailConfirmation: false,  // Email confirmation to user
  contactTelegramNotify: false,     // Telegram notification to admin

  // Footer features
  footerNav: true,            // Navigation links in footer
  footerCta: true,            // CTA button in footer
  footerLegalLinks: true,     // Privacy/Terms links
  footerMadeWith: true,       // "Made with Puppet Master" branding
  backToTop: true             // Back-to-top button
}
```

---

### Header Contact

Quick contact buttons in the website header.

```typescript
headerContact: {
  enabled: true,
  items: ['contact.phone', 'social.telegram']  // Max 2 recommended
}
```

Uses setting keys from the settings array. Only shown if the setting has a value in the database.

---

### Storage Configuration

File upload settings for images and videos.

```typescript
storage: {
  provider: 'local',  // 'local' | 's3'

  image: {
    maxSizeMB: 10,           // Max upload size
    maxWidth: 1920,          // Resize to max width
    maxHeight: 1080,         // Resize to max height
    quality: 85,             // WebP quality (1-100)
    thumbnailWidth: 400,     // Thumbnail dimensions
    thumbnailHeight: 300,
    thumbnailQuality: 75
  },

  video: {
    enabled: true,
    maxSizeMB: 100,
    maxDurationSeconds: 300,  // 5 minutes max
    allowedTypes: ['mp4', 'webm', 'mov', 'avi'],
    outputFormat: 'mp4',
    compression: {
      videoBitrate: '2M',
      audioBitrate: '128k',
      maxWidth: 1920,
      fps: 30
    }
  }
}
```

**Storage providers:**
- `local` - Files in `public/uploads/` (good for small/medium sites)
- `s3` - S3-compatible storage (AWS, Cloudflare R2, MinIO)

For S3, configure environment variables (see Environment Variables section).

---

### Data Source Configuration

Configure where application data comes from.

```typescript
dataSource: {
  provider: 'database',  // 'database' | 'api' | 'hybrid'

  // Per-resource config (only for 'hybrid' mode)
  resources: {
    users: 'database',
    sessions: 'database',
    settings: 'database',
    portfolio: 'database',
    contacts: 'database',
    translations: 'database'
  },

  // API client settings
  api: {
    timeout: 30000,

    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    },

    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      resetTimeout: 60000
    },

    cache: {
      enabled: true,
      ttl: {
        users: 300,        // 5 min
        sessions: 60,      // 1 min
        settings: 600,     // 10 min
        portfolio: 180,    // 3 min
        contacts: 0,       // No cache
        translations: 3600 // 1 hour
      }
    }
  }
}
```

**Providers:**
- `database` - Local SQLite (zero config, default)
- `api` - External REST API (requires API_* environment variables)
- `hybrid` - Mix sources per resource

---

### Navigation Sections

Source of truth for website navigation.

```typescript
sections: [
  { id: 'home', inNav: true },
  { id: 'about', inNav: true },
  { id: 'portfolio', inNav: true },
  { id: 'services', inNav: true },
  { id: 'contact', inNav: true }
]
```

The `id` maps to:
- Route: `/` for home, `/{id}` for others
- Translation key: `nav.{id}`
- CSS section: `.section-{id}`

---

### Admin Navigation

Source of truth for admin panel navigation.

```typescript
adminSections: [
  { id: 'settings', icon: 'settings', label: 'settings', badge: false, roles: [] },
  { id: 'portfolios', icon: 'photo', label: 'portfolio', badge: false, roles: [] },
  { id: 'contacts', icon: 'mail', label: 'contacts', badge: true, roles: [] },
  { id: 'translations', icon: 'language', label: 'translations', badge: false, roles: [] },
  { id: 'users', icon: 'users', label: 'users', badge: false, roles: ['master', 'admin'] },
  { id: 'health', icon: 'heartbeat', label: 'health', badge: false, roles: ['master'] }
]
```

| Property | Description |
|----------|-------------|
| `id` | Route name (maps to `/admin/{id}`) |
| `icon` | Tabler icon name (without `tabler:` prefix) |
| `label` | i18n key suffix (full key: `admin.nav{Label}`) |
| `badge` | Show unread count badge |
| `roles` | Access restriction (empty = all roles) |

---

### Locales and Themes

Language and theme configuration.

```typescript
locales: [
  { code: 'en', iso: 'en-US', name: 'English' },
  { code: 'ru', iso: 'ru-RU', name: 'Русский' },
  { code: 'he', iso: 'he-IL', name: 'עברית' }
],
defaultLocale: 'en',

defaultTheme: 'system'  // 'system' | 'light' | 'dark'
```

**Language detection priority:**
1. User's saved preference (cookie)
2. Browser language (if supported)
3. `defaultLocale` (fallback)

**Theme detection priority:**
1. User's saved preference (cookie)
2. `defaultTheme` setting
3. System preference (when `defaultTheme` is 'system')

**RTL support:** Auto-detected from locale code (he, ar, fa, ur).

---

### Logo Configuration

Theme and language-aware logo system.

```typescript
logo: {
  basePath: '/logos',

  shapes: {
    horizontal: 'header',  // Full logo for header
    circle: 'short'        // Compact logo for sidebar/footer
  },

  langFallback: {
    he: 'en'  // Hebrew falls back to English
  },

  available: [
    'horizontal_dark_en',
    'horizontal_dark_ru',
    'horizontal_light_en',
    'horizontal_light_ru',
    'circle_dark_en',
    'circle_dark_ru',
    'circle_light_en',
    'circle_light_ru'
  ]
}
```

**Naming convention:** `/logos/{shape}_{theme}_{lang}.svg`
- Shape: `horizontal` or `circle`
- Theme: `light` (for dark backgrounds) or `dark` (for light backgrounds)
- Lang: locale code

**Usage in components:**
```typescript
const { headerLogo, shortLogo } = useLogo()
```

---

### Brand Colors

Four color primitives - everything else is auto-calculated.

```typescript
colors: {
  black: '#2f2f2f',   // Charcoal gray
  white: '#f0f0f0',   // Off-white
  brand: '#aa0000',   // Primary brand color
  accent: '#0f172a'   // Secondary/contrast color
}
```

These colors are converted to OKLCH and used to generate the entire color system via CSS `color-mix()` and `light-dark()`.

To change colors, edit `app/assets/css/colors/primitives.css`:

```css
:root {
  --p-black: #2f2f2f;
  --p-white: #f0f0f0;
  --p-brand: #aa0000;
  --p-accent: #0f172a;
}
```

---

### Settings Schema

Defines which settings exist. Values are entered via Admin Panel.

```typescript
settings: [
  // Contact
  { key: 'contact.email', type: 'email', group: 'contact', label: 'Email', icon: 'mail' },
  { key: 'contact.phone', type: 'tel', group: 'contact', label: 'Phone', icon: 'phone' },
  { key: 'contact.location', type: 'string', group: 'contact', label: 'Location', icon: 'map-pin' },

  // Social (20+ platforms supported)
  { key: 'social.telegram', type: 'url', group: 'social', label: 'Telegram', icon: 'brand-telegram' },
  { key: 'social.instagram', type: 'url', group: 'social', label: 'Instagram', icon: 'brand-instagram' },
  // ... more platforms

  // Legal
  { key: 'legal.companyName', type: 'string', group: 'legal', label: 'Company Name' },
  { key: 'legal.inn', type: 'string', group: 'legal', label: 'Tax ID' },

  // Footer
  { key: 'footer.ctaUrl', type: 'url', group: 'footer', label: 'CTA Button URL' },
  { key: 'footer.privacyUrl', type: 'url', group: 'footer', label: 'Privacy Policy URL' },

  // SEO
  { key: 'seo.title', type: 'string', group: 'seo', label: 'Default Page Title' },
  { key: 'seo.description', type: 'text', group: 'seo', label: 'Meta Description' },

  // Analytics
  { key: 'analytics.googleId', type: 'string', group: 'analytics', label: 'Google Analytics ID' },
  { key: 'analytics.yandexId', type: 'string', group: 'analytics', label: 'Yandex Metrica ID' }
]
```

**Setting types:**
- `string` - Single line text
- `text` - Multi-line text
- `email` - Email address
- `tel` - Phone number
- `url` - URL
- `boolean` - True/false toggle

**Usage in components:**
```vue
<SocialNav />    <!-- Renders all social.* with values -->
<ContactInfo />  <!-- Renders all contact.* with values -->
```

---

## Environment Variables

Located in `.env` (copy from `.env.example`). Runtime configuration.

### Database

```bash
DATABASE_URL=./data/sqlite.db
```

SQLite database path relative to the app folder.

---

### SMTP (Email)

Required if `features.contactEmailConfirmation = true`.

```bash
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
SMTP_FROM=Your Site Name <your-email@yandex.ru>
```

**Common providers:**
- Yandex: `smtp.yandex.ru:465`
- Gmail: `smtp.gmail.com:587` (requires App Password)
- Mailgun: `smtp.mailgun.org:587`

---

### Telegram Bot

Required if `features.contactTelegramNotify = true`.

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

**Setup:**
1. Message [@BotFather](https://t.me/botfather) → `/newbot` → copy token
2. Message [@userinfobot](https://t.me/userinfobot) to get your chat ID

---

### S3 Storage

Required if `storage.provider = 's3'`.

```bash
S3_ENDPOINT=https://your-endpoint.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=auto
S3_PUBLIC_URL=https://cdn.yoursite.com
```

**Providers:**
- AWS S3: `https://s3.{region}.amazonaws.com`
- Cloudflare R2: `https://{account-id}.r2.cloudflarestorage.com`
- DigitalOcean Spaces: `https://{region}.digitaloceanspaces.com`
- MinIO: Your MinIO server URL

---

### External API

Required if `dataSource.provider = 'api'` or `'hybrid'`.

```bash
# Base URL
API_BASE_URL=https://api.example.com/v1

# OAuth 2.0 (recommended)
API_CLIENT_ID=your-client-id
API_CLIENT_SECRET=your-client-secret
API_TOKEN_URL=https://auth.example.com/oauth/token

# Alternative: Static JWT
# API_JWT_TOKEN=eyJhbGciOiJIUzI1NiIs...

# Alternative: API Key (least secure)
# API_KEY=your-api-key

# Token refresh buffer (seconds)
API_TOKEN_REFRESH_BUFFER=300
```

---

### Redis Cache

For multi-instance deployments behind a load balancer.

```bash
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=pm-cache:
```

For single-instance deployments, in-memory cache is sufficient.

---

### Monitoring

Optional Uptime Kuma integration.

```bash
SITE_DOMAIN=example.com
UPTIME_KUMA_SUBDOMAIN=status
```

Admin health page will link to `https://status.example.com`.

---

## Nuxt Configuration

Located at `nuxt.config.ts`. Most settings are auto-configured from `puppet-master.config.ts`.

### Color Mode

```typescript
colorMode: {
  preference: config.defaultTheme,
  classSuffix: '',
  storageKey: 'pm-color-mode'
}
```

### i18n

```typescript
i18n: {
  locales: config.locales.map(l => ({ ...l, file: 'loader.ts', preload: true })),
  defaultLocale: config.defaultLocale,
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'pm-i18n-redirected',
    alwaysRedirect: false,
    redirectOn: 'root'
  }
}
```

**URL strategy:** Default locale has no prefix, others have prefix:
- English (default): `/about`
- Russian: `/ru/about`
- Hebrew: `/he/about`

### PWA

Automatically enabled when `features.pwa = true`. Includes:
- App manifest with icons
- Service worker for offline support
- Runtime caching for fonts and assets
- Auto-update with periodic checks

### PostCSS

Configured for modern CSS with fallbacks:

```typescript
postcss: {
  plugins: {
    'postcss-preset-env': {
      stage: 2,
      features: {
        'custom-media-queries': true,
        'nesting-rules': true,
        'color-mix': true,
        'custom-properties': true
      }
    }
  }
}
```

---

## Common Configuration Tasks

### Add a New Language

1. Add locale to config:
```typescript
locales: [
  // existing...
  { code: 'de', iso: 'de-DE', name: 'Deutsch' }
]
```

2. Add translations in admin panel or seed file

3. Add logo variants (optional):
```
public/logos/horizontal_dark_de.svg
public/logos/horizontal_light_de.svg
public/logos/circle_dark_de.svg
public/logos/circle_light_de.svg
```

### Add a New Social Platform

Add to settings array:
```typescript
{ key: 'social.mastodon', type: 'url', group: 'social', label: 'Mastodon', icon: 'brand-mastodon' }
```

Then enter the URL in the admin panel.

### Add a New Setting

1. Add to settings array:
```typescript
{ key: 'custom.myField', type: 'string', group: 'custom', label: 'My Field' }
```

2. Add the group if new:
```typescript
settingGroups: [
  // existing...
  { key: 'custom', label: 'admin.settingsCustom', icon: 'adjustments' }
]
```

3. Add translation for the group label

### Disable a Feature

```typescript
features: {
  multiLangs: false,     // Single language
  doubleTheme: false,    // No theme toggle
  onepager: false,       // Route-based navigation
  pwa: false,            // No PWA
  footerMadeWith: false  // No branding
}
```

### Switch to S3 Storage

1. Set in config:
```typescript
storage: {
  provider: 's3',
  // ... rest of config
}
```

2. Add environment variables:
```bash
S3_ENDPOINT=https://...
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_URL=...
```

---

## Configuration Best Practices

1. **Keep defaults minimal** - Only configure what differs from defaults
2. **Use environment variables for secrets** - Never commit `.env`
3. **Rebuild after config changes** - `puppet-master.config.ts` requires rebuild
4. **Test mode changes thoroughly** - Different modes have different behaviors
5. **Use feature flags** - Disable features cleanly instead of commenting code
