/**
 * Puppet Master Configuration
 * Build-time configuration - changes require rebuild
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION MODE - Primary configuration that affects entire app structure
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL MODES (two distinct UX patterns):
 *   - Website: Traditional site UX (hamburger menu on mobile, can use onepager)
 *   - App: Application UX (bottom nav on mobile, vertical sidebar, always SPA)
 *
 * IMPORTANT: Website portion uses WEBSITE visual mode. App/Admin uses APP visual mode.
 *            These are separate experiences - admin is always app-style regardless of mode.
 *
 * ┌─────────────────┬──────────────────────────┬───────────────────────────────┐
 * │ Mode            │ Website Portion          │ App/Admin Portion             │
 * ├─────────────────┼──────────────────────────┼───────────────────────────────┤
 * │ app-only        │ ❌ None                  │ App (vertical sidebar, SPA)   │
 * │ website-app     │ Website (hamburger, can  │ App (vertical sidebar, SPA)   │
 * │                 │ onepager OR SPA)         │ Login button visible          │
 * │ website-admin   │ Website (hamburger, can  │ Admin (vertical sidebar, SPA) │
 * │                 │ onepager OR SPA)         │ Hidden admin at /admin        │
 * │ website-only    │ Website (hamburger, can  │ ❌ None                       │
 * │                 │ onepager OR SPA)         │                               │
 * └─────────────────┴──────────────────────────┴───────────────────────────────┘
 *
 * Use Cases:
 *   - app-only:      SaaS dashboard, internal tools, no public landing page
 *   - website-app:   Product with marketing site + user login (e.g., Notion, Figma)
 *   - website-admin: Portfolio/agency site with hidden CMS (current default)
 *   - website-only:  Static site, no admin needed (pure marketing/portfolio)
 *
 * NOTE: 'onepager' toggle only affects the WEBSITE portion.
 *       The App/Admin portions ALWAYS use SPA with route navigation.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export type AppMode = 'app-only' | 'website-app' | 'website-admin' | 'website-only'

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
    onepager: true,             // Website portion: Onepager (scroll nav) vs SPA (route nav)
    interactiveHeader: true,    // Header style changes on scroll
    hideHeaderOnScroll: false,  // Hide header when scrolling down
    verticalNav: false,         // true = icon sidebar, false = horizontal header

    // Admin features (only apply when mode has admin)
    appVerticalNav: true,       // App mode: true = vertical sidebar, false = horizontal nav
    // TODO: App-style bottom nav for mobile (mark for later)

    // Contact form notifications
    // ⚠️ Requires .env configuration - see .env.example
    contactEmailConfirmation: false,   // Send confirmation email to user (requires SMTP_* in .env)
    contactTelegramNotify: false,      // Send Telegram notification to admin (requires TELEGRAM_* in .env)

    // Footer features
    footerNav: true,              // Show footer navigation links (from sections)
    footerCta: true,              // Show CTA button in footer
    footerLegalLinks: true,       // Show legal links (Privacy, Terms)
    footerMadeWith: true,         // Show "Made with Puppet Master" branding
    backToTop: true,              // Show back-to-top button on scroll
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE - File uploads configuration (images & videos)
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Provider options:
  //   - 'local': Files stored in public/uploads/ (good for small/medium sites)
  //   - 's3': Files stored in S3-compatible bucket (AWS S3, Cloudflare R2, MinIO)
  //
  // For S3, set these environment variables in .env:
  //   S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_PUBLIC_URL
  //
  // Video processing uses FFmpeg to compress and optimize for web playback.
  // ═══════════════════════════════════════════════════════════════════════════
  storage: {
    provider: 'local' as 'local' | 's3',

    // Image settings
    image: {
      maxSizeMB: 10,                    // Max upload size
      maxWidth: 1920,                   // Resize to max width
      maxHeight: 1080,                  // Resize to max height
      quality: 85,                      // WebP quality (1-100)
      thumbnailWidth: 400,              // Thumbnail width
      thumbnailHeight: 300,             // Thumbnail height
      thumbnailQuality: 75,             // Thumbnail WebP quality
    },

    // Video settings
    video: {
      enabled: true,                    // Allow video uploads
      maxSizeMB: 100,                   // Max upload size
      maxDurationSeconds: 300,          // Max 5 minutes
      allowedTypes: ['mp4', 'webm', 'mov', 'avi'],
      outputFormat: 'mp4' as 'mp4' | 'webm',
      // FFmpeg compression settings
      compression: {
        videoBitrate: '2M',             // Target video bitrate
        audioBitrate: '128k',           // Target audio bitrate
        maxWidth: 1920,                 // Scale down if larger
        fps: 30,                        // Target frame rate
      }
    }
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

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE & THEME DEFAULTS
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Language detection priority:
  //   1. User's saved preference (cookie from previous visit)
  //   2. Browser language (if matches one of available locales)
  //   3. defaultLocale (fallback when browser lang not supported)
  //
  // Theme detection priority:
  //   1. User's saved preference (cookie from previous visit)
  //   2. defaultTheme setting below
  //   3. System preference (only when defaultTheme is 'system')
  //
  // RTL is auto-detected from locale code (he, ar, fa, ur)
  // Translations come from DATABASE - run `npm run db:seed` for initial data
  // ═══════════════════════════════════════════════════════════════════════════
  locales: [
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'ru', iso: 'ru-RU', name: 'Русский' },
    { code: 'he', iso: 'he-IL', name: 'עברית' }
  ],
  defaultLocale: 'en',

  // Default theme: 'system' | 'light' | 'dark'
  // - 'system': Respect user's OS preference (recommended for most sites)
  // - 'light': Force light mode by default (e.g., clean corporate site)
  // - 'dark': Force dark mode by default (e.g., gaming/photography portfolio)
  defaultTheme: 'system' as 'system' | 'light' | 'dark',

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
    // Contact Information (displayed via <ContactInfo /> component)
    // Icons are Tabler icon names: https://tabler.io/icons
    { key: 'contact.email', type: 'email', group: 'contact', label: 'Email', icon: 'mail' },
    { key: 'contact.phone', type: 'tel', group: 'contact', label: 'Phone', icon: 'phone' },
    // Location: empty=hidden, address text=show text, coordinates (lat,lng)=show Yandex map
    { key: 'contact.location', type: 'string', group: 'contact', label: 'Location', icon: 'map-pin' },

    // Social Links (displayed via <SocialNav /> component)
    // Icons: Tabler brand icons (https://tabler.io/icons) or custom-* for custom icons
    // ─── Messaging ───
    { key: 'social.telegram', type: 'url', group: 'social', label: 'Telegram', icon: 'brand-telegram' },
    { key: 'social.whatsapp', type: 'url', group: 'social', label: 'WhatsApp', icon: 'brand-whatsapp' },
    { key: 'social.viber', type: 'url', group: 'social', label: 'Viber', icon: 'brand-viber' },
    { key: 'social.discord', type: 'url', group: 'social', label: 'Discord', icon: 'brand-discord' },
    { key: 'social.max', type: 'url', group: 'social', label: 'MAX Messenger', icon: 'custom-max' },
    // ─── Social Networks ───
    { key: 'social.instagram', type: 'url', group: 'social', label: 'Instagram', icon: 'brand-instagram' },
    { key: 'social.facebook', type: 'url', group: 'social', label: 'Facebook', icon: 'brand-facebook' },
    { key: 'social.twitter', type: 'url', group: 'social', label: 'Twitter/X', icon: 'brand-x' },
    { key: 'social.threads', type: 'url', group: 'social', label: 'Threads', icon: 'brand-threads' },
    { key: 'social.tiktok', type: 'url', group: 'social', label: 'TikTok', icon: 'brand-tiktok' },
    { key: 'social.pinterest', type: 'url', group: 'social', label: 'Pinterest', icon: 'brand-pinterest' },
    { key: 'social.vk', type: 'url', group: 'social', label: 'VK (ВКонтакте)', icon: 'brand-vk' },
    // ─── Video ───
    { key: 'social.youtube', type: 'url', group: 'social', label: 'YouTube', icon: 'brand-youtube' },
    { key: 'social.twitch', type: 'url', group: 'social', label: 'Twitch', icon: 'brand-twitch' },
    // ─── Professional ───
    { key: 'social.linkedin', type: 'url', group: 'social', label: 'LinkedIn', icon: 'brand-linkedin' },
    { key: 'social.medium', type: 'url', group: 'social', label: 'Medium', icon: 'brand-medium' },
    // ─── Dev/Design ───
    { key: 'social.github', type: 'url', group: 'social', label: 'GitHub', icon: 'brand-github' },
    { key: 'social.gitlab', type: 'url', group: 'social', label: 'GitLab', icon: 'brand-gitlab' },
    { key: 'social.dribbble', type: 'url', group: 'social', label: 'Dribbble', icon: 'brand-dribbble' },
    { key: 'social.behance', type: 'url', group: 'social', label: 'Behance', icon: 'brand-behance' },

    // Legal/Juridical Info (displayed in footer small print)
    // Russian: ИНН, ОГРН, Юридический адрес
    { key: 'legal.companyName', type: 'string', group: 'legal', label: 'Company Name (for copyright)' },
    { key: 'legal.inn', type: 'string', group: 'legal', label: 'ИНН (Tax ID)' },
    { key: 'legal.ogrn', type: 'string', group: 'legal', label: 'ОГРН (Registration Number)' },
    { key: 'legal.address', type: 'string', group: 'legal', label: 'Legal Address' },
    { key: 'legal.email', type: 'email', group: 'legal', label: 'Legal Email' },

    // Footer Settings (CTA and legal links)
    { key: 'footer.ctaText', type: 'string', group: 'footer', label: 'CTA Button Text' },
    { key: 'footer.ctaUrl', type: 'url', group: 'footer', label: 'CTA Button URL' },
    { key: 'footer.privacyUrl', type: 'url', group: 'footer', label: 'Privacy Policy URL' },
    { key: 'footer.termsUrl', type: 'url', group: 'footer', label: 'Terms of Service URL' },

    // SEO & Meta
    { key: 'seo.title', type: 'string', group: 'seo', label: 'Default Page Title' },
    { key: 'seo.description', type: 'text', group: 'seo', label: 'Meta Description' },
    { key: 'seo.keywords', type: 'string', group: 'seo', label: 'Meta Keywords (comma-separated)' },

    // Analytics (IDs only - scripts injected by plugins)
    { key: 'analytics.googleId', type: 'string', group: 'analytics', label: 'Google Analytics ID (G-XXXXXXXX)' },
    { key: 'analytics.yandexId', type: 'string', group: 'analytics', label: 'Yandex Metrica ID' },
    { key: 'analytics.facebookPixel', type: 'string', group: 'analytics', label: 'Facebook Pixel ID' },

    // Verification codes (for webmaster tools)
    { key: 'verification.google', type: 'string', group: 'verification', label: 'Google Search Console' },
    { key: 'verification.yandex', type: 'string', group: 'verification', label: 'Yandex Webmaster' }
  ] as const,

  // Setting groups (for admin UI organization)
  settingGroups: [
    { key: 'contact', label: 'Contact Info', icon: 'address-book' },
    { key: 'social', label: 'Social Links', icon: 'share' },
    { key: 'legal', label: 'Legal Info', icon: 'file-certificate' },
    { key: 'footer', label: 'Footer', icon: 'layout-bottombar' },
    { key: 'seo', label: 'SEO & Meta', icon: 'search' },
    { key: 'analytics', label: 'Analytics', icon: 'chart-bar' },
    { key: 'verification', label: 'Verification', icon: 'certificate' }
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
    return this.mode === 'website-app'
  },

  get isAppPrimary(): boolean {
    return this.mode === 'app-only' || this.mode === 'website-app'
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
    // Onepager applies to the website portion (when it exists)
    return this.hasWebsite && this.features.onepager
  },

  get useInteractiveHeader(): boolean {
    return this.hasWebsite && this.features.interactiveHeader
  }
}

export default config

