/**
 * Puppet Master Configuration
 * Build-time configuration - changes require rebuild
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION MODE - Primary configuration that affects entire app structure
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────┬─────────┬──────────────┬─────────────────┬─────────────┐
 * │ Mode            │ Website │ Login Button │ Admin Access    │ Primary App │
 * ├─────────────────┼─────────┼──────────────┼─────────────────┼─────────────┤
 * │ app-only        │ ❌      │ N/A          │ / → /login      │ Admin       │
 * │ site-app        │ ✅      │ ✅ Visible   │ /login route    │ Admin       │
 * │ website-admin   │ ✅      │ ❌ Hidden    │ /admin (secret) │ Website     │
 * │ website-only    │ ✅      │ ❌ None      │ ❌ No admin     │ Website     │
 * └─────────────────┴─────────┴──────────────┴─────────────────┴─────────────┘
 *
 * Use Cases:
 *   - app-only:      SaaS dashboard, internal tools, no public landing page
 *   - site-app:      Product with marketing site + user login (e.g., Notion, Figma)
 *   - website-admin: Portfolio/agency site with hidden CMS (current default)
 *   - website-only:  Static site, no admin needed (pure marketing/portfolio)
 *
 * NOTE: 'onepager' toggle only affects modes with website (not app-only)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export type AppMode = 'app-only' | 'site-app' | 'website-admin' | 'website-only'

const config = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MODE - Choose your application structure
  // ═══════════════════════════════════════════════════════════════════════════
  mode: 'website-admin' as AppMode,

  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURE TOGGLES - Fine-tune behavior within the chosen mode
  // ═══════════════════════════════════════════════════════════════════════════
  features: {
    // Website features (only apply when mode has website)
    multiLangs: true,           // Multiple languages support
    doubleTheme: true,          // Light/dark mode toggle
    onepager: true,             // Onepager (scroll nav) vs SPA (route nav)
    interactiveHeader: true,    // Header style changes on scroll
    hideHeaderOnScroll: false,  // Hide header when scrolling down
    verticalNav: false,         // true = icon sidebar, false = horizontal header

    // Admin features (only apply when mode has admin)
    adminVerticalNav: true,     // true = icon sidebar, false = horizontal nav
    // TODO: App-style bottom nav for mobile (mark for later)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTIONS - Source of truth for navigation and routing
  // ═══════════════════════════════════════════════════════════════════════════
  sections: [
    { id: 'home', inNav: true },
    { id: 'about', inNav: true },
    { id: 'portfolio', inNav: true },
    { id: 'services', inNav: true },
    { id: 'contact', inNav: true }
  ] as const,

  // Available locales (when multiLangs: true)
  // RTL is auto-detected from locale code (he, ar, fa, ur) - no need to specify
  // Translations come from DATABASE, not JSON files!
  // JSON files are only fallback defaults for initial setup
  locales: [
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'ru', iso: 'ru-RU', name: 'Русский' },
    { code: 'he', iso: 'he-IL', name: 'עברית' }
  ],
  defaultLocale: 'en',

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGO CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Naming convention: /logos/{shape}_{theme}_{lang}.svg
  //   Shape: 'horizontal' (header) or 'circle' (short/compact)
  //   Theme: 'light' (for dark backgrounds) or 'dark' (for light backgrounds)
  //   Lang:  'en', 'ru', 'he', etc.
  //
  // The system automatically picks the right logo based on:
  //   1. Current theme (light/dark mode)
  //   2. Current language
  //   3. Fallback chain if variant doesn't exist
  //
  // Usage in components:
  //   const { headerLogo, shortLogo } = useLogo()
  // ═══════════════════════════════════════════════════════════════════════════
  logo: {
    // Base path to logos (in public folder)
    basePath: '/logos',

    // Available shapes and where they're used
    shapes: {
      horizontal: 'header',  // Full logo for desktop header
      circle: 'short'        // Compact logo for sidebar, footer, icons
    },

    // Fallback chain for languages without their own logo
    // If Hebrew logo doesn't exist, use English (not Russian)
    langFallback: {
      he: 'en',  // Hebrew → English
      ar: 'en',  // Arabic → English (if added later)
      // Add more fallbacks as needed
    },

    // Available logo files (for validation/preloading)
    // The system generates paths like: /logos/horizontal_dark_en.svg
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
  },

  // Brand colors - the 4 primitives
  // Derived from Puppet Master logo design
  // Everything else is auto-calculated via CSS color-mix() and light-dark()
  colors: {
    black: '#2f2f2f',   // Charcoal gray (from logo dark text)
    white: '#f0f0f0',   // Off-white (from logo light text)
    brand: '#aa0000',   // Dark red/maroon (from logo accent)
    accent: '#0f172a'   // Deep slate (for contrast)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS SCHEMA - Config-Driven Settings Definition
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // MOTTO: "The config file is the developer's best friend!"
  //
  // This defines WHICH settings exist. VALUES are entered via Admin Panel.
  //
  // Schema:
  //   key      - Unique identifier (group.name format)
  //   type     - Input type: 'string', 'url', 'email', 'tel', 'text', 'boolean'
  //   group    - Admin panel grouping
  //   label    - Human-readable label for admin UI
  //   icon     - Tabler icon name (optional, for display in components)
  //
  // Components:
  //   <SocialNav />    - Renders all social.* with values (icons auto: brand-{platform})
  //   <ContactInfo />  - Renders all contact.* with values (icons from config)
  //
  // ═══════════════════════════════════════════════════════════════════════════
  settings: [
    // Site Identity (used programmatically, no icons needed)
    { key: 'site.name', type: 'string', group: 'site', label: 'Site Name' },
    { key: 'site.tagline', type: 'string', group: 'site', label: 'Tagline' },

    // Contact Information (displayed via <ContactInfo /> component)
    // Icons are Tabler icon names: https://tabler.io/icons
    { key: 'contact.email', type: 'email', group: 'contact', label: 'Email', icon: 'mail' },
    { key: 'contact.phone', type: 'tel', group: 'contact', label: 'Phone', icon: 'phone' },
    // Location: empty=hidden, address text=show text, coordinates (lat,lng)=show Yandex map
    { key: 'contact.location', type: 'string', group: 'contact', label: 'Location', icon: 'map-pin' },

    // Social Links (displayed via <SocialNav /> component)
    // Icons are Tabler brand icons: https://tabler.io/icons (search "brand")
    { key: 'social.telegram', type: 'url', group: 'social', label: 'Telegram', icon: 'brand-telegram' },
    { key: 'social.instagram', type: 'url', group: 'social', label: 'Instagram', icon: 'brand-instagram' },
    { key: 'social.whatsapp', type: 'url', group: 'social', label: 'WhatsApp', icon: 'brand-whatsapp' },
    { key: 'social.facebook', type: 'url', group: 'social', label: 'Facebook', icon: 'brand-facebook' },
    { key: 'social.youtube', type: 'url', group: 'social', label: 'YouTube', icon: 'brand-youtube' },
    { key: 'social.linkedin', type: 'url', group: 'social', label: 'LinkedIn', icon: 'brand-linkedin' },
    { key: 'social.twitter', type: 'url', group: 'social', label: 'Twitter/X', icon: 'brand-x' },
    { key: 'social.github', type: 'url', group: 'social', label: 'GitHub', icon: 'brand-github' },

    // Legal/Juridical Info (displayed in footer small print)
    // Russian: ИНН, ОГРН, Юридический адрес
    { key: 'legal.companyName', type: 'string', group: 'legal', label: 'Company Name (for copyright)' },
    { key: 'legal.inn', type: 'string', group: 'legal', label: 'ИНН (Tax ID)' },
    { key: 'legal.ogrn', type: 'string', group: 'legal', label: 'ОГРН (Registration Number)' },
    { key: 'legal.address', type: 'string', group: 'legal', label: 'Legal Address' },
    { key: 'legal.email', type: 'email', group: 'legal', label: 'Legal Email' },

    // SEO (used by useHead, no icons needed)
    { key: 'seo.title', type: 'string', group: 'seo', label: 'Default Page Title' },
    { key: 'seo.description', type: 'text', group: 'seo', label: 'Meta Description' }
  ] as const,

  // Setting groups (for admin UI organization)
  settingGroups: [
    { key: 'site', label: 'Site Identity', icon: 'building' },
    { key: 'contact', label: 'Contact Info', icon: 'address-book' },
    { key: 'social', label: 'Social Links', icon: 'share' },
    { key: 'legal', label: 'Legal Info', icon: 'file-certificate' },
    { key: 'seo', label: 'SEO Settings', icon: 'search' }
  ] as const,

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED HELPERS - Convenient access to derived values
  // ═══════════════════════════════════════════════════════════════════════════

  // Mode-based helpers
  get hasWebsite(): boolean {
    return this.mode !== 'app-only'
  },

  get hasAdmin(): boolean {
    return this.mode !== 'website-only'
  },

  get hasLoginButton(): boolean {
    return this.mode === 'site-app'
  },

  get isAppPrimary(): boolean {
    return this.mode === 'app-only' || this.mode === 'site-app'
  },

  get isWebsitePrimary(): boolean {
    return this.mode === 'website-admin' || this.mode === 'website-only'
  },

  // Feature helpers
  get isMultiLang(): boolean {
    return this.features.multiLangs && this.locales.length > 1
  },

  get hasThemeToggle(): boolean {
    return this.features.doubleTheme
  },

  // Combined helpers (mode + features)
  get useOnepager(): boolean {
    return this.hasWebsite && this.features.onepager
  },

  get useInteractiveHeader(): boolean {
    return this.hasWebsite && this.features.interactiveHeader
  }
}

export default config

