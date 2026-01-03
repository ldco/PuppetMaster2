/**
 * Puppet Master Configuration
 * Build-time configuration - changes require rebuild
 */

import type { ModulesConfig } from './types/modules'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION MODE - Primary configuration that affects entire app structure
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Two visual modes exist:
 *   - Website: Traditional site UX (hamburger menu on mobile)
 *   - App: Application UX (bottom nav on mobile, vertical header default)
 *   - Admin: Always uses App visual mode (it's an application interface)
 *
 * ┌─────────────────┬─────────┬──────────────┬─────────────────┬─────────────┐
 * │ Mode            │ Website │ Login Button │ Admin Access    │ Visual Mode │
 * ├─────────────────┼─────────┼──────────────┼─────────────────┼─────────────┤
 * │ app-only        │ ❌      │ N/A          │ / → /login      │ App         │
 * │ website-app     │ ✅      │ ✅ Visible   │ /login route    │ App primary │
 * │ website-admin   │ ✅      │ ❌ Hidden    │ /admin (secret) │ Website     │
 * │ website-only    │ ✅      │ ❌ None      │ ❌ No admin     │ Website     │
 * └─────────────────┴─────────┴──────────────┴─────────────────┴─────────────┘
 *
 * Use Cases:
 *   - app-only:      SaaS dashboard, internal tools, no public landing page
 *   - website-app:   Product with marketing site + user login (e.g., Notion, Figma)
 *   - website-admin: Portfolio/agency site with hidden CMS (current default)
 *   - website-only:  Static site, no admin needed (pure marketing/portfolio)
 *
 * NOTE: 'onepager' toggle only affects the website portion (not app-only mode).
 *       The app/admin portions always use SPA with route navigation.
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
    multiLangs: true, // Multiple languages support
    doubleTheme: true, // Light/dark mode toggle
    onepager: false, // Website mode: Onepager (scroll nav) vs SPA (route nav). Ignored in app modes.
    interactiveHeader: true, // Header style changes on scroll
    hideHeaderOnScroll: false, // Hide header when scrolling down
    verticalNav: false, // true = icon sidebar, false = horizontal header

    // Page transitions (SPA mode only - ignored in onepager mode)
    // Animation options:
    //   Basic: 'fade' | 'slide-left' | 'slide-up' | 'scale'
    //   Fancy: 'zoom' | 'flip' | 'rotate' | 'blur' | 'bounce' | 'swipe'
    //   Disabled: '' (empty string)
    pageTransitions: 'zoom' as
      | 'fade'
      | 'slide-left'
      | 'slide-up'
      | 'scale'
      | 'zoom'
      | 'flip'
      | 'rotate'
      | 'blur'
      | 'bounce'
      | 'swipe'
      | '',

    // Admin features (only apply when mode has admin)
    appVerticalNav: true, // App mode: true = vertical sidebar, false = horizontal nav

    // PWA (Progressive Web App) support
    // Enables: installable app, offline support, service worker caching
    // Uses @vite-pwa/nuxt module - requires rebuild after toggle
    pwa: false,

    // Contact form notifications
    // ⚠️ Requires .env configuration - see .env.example
    contactEmailConfirmation: false, // Send confirmation email to user (requires SMTP_* in .env)
    contactTelegramNotify: false, // Send Telegram notification to admin (requires TELEGRAM_* in .env)

    // Footer features
    footerNav: true, // Show footer navigation links (from sections)
    footerCta: true, // Show CTA button in footer
    footerLegalLinks: true, // Show legal links (Privacy, Terms)
    footerMadeWith: true, // Show "Made with Puppet Master" branding
    backToTop: true, // Show back-to-top button on scroll

  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULES - Pre-built, config-driven features
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Each module provides: database tables, API endpoints, admin UI, frontend pages.
  // Enable modules per-project and customize their behavior via config.
  //
  // Available modules:
  //   - portfolio:    Project showcase with galleries and case studies
  //   - pricing:      Pricing tiers with comparison table
  //   - contact:      Contact form, map, and info display
  //   - blog:         Blog posts with categories, tags, and media
  //   - team:         Team member profiles with photos and social links
  //   - testimonials: Customer testimonials and reviews
  //   - features:     Feature cards with icons (replaces services)
  //   - clients:      Client/sponsor/partner logos
  //   - faq:          Frequently asked questions accordion
  //
  // ═══════════════════════════════════════════════════════════════════════════
  modules: {
    portfolio: {
      enabled: true,
      config: {
        layout: 'grid',
        cardStyle: 'overlay',
        showFilters: true,
        showCaseStudies: true,
        showGallery: true,
        itemsPerPage: 12,
        sortDefault: 'order',
        showCategories: true,
        showTechnologies: true
      }
    },
    pricing: {
      enabled: true,
      config: {
        tiers: [
          {
            id: 'starter',
            name: 'Starter',
            description: 'Perfect for small projects',
            price: 0,
            period: 'month',
            currency: 'USD',
            featured: false,
            features: [
              { text: 'Up to 3 pages', included: true },
              { text: 'Basic blocks', included: true },
              { text: 'Community support', included: true },
              { text: 'Visual editor', included: false },
              { text: 'Custom modules', included: false }
            ],
            cta: { text: 'Get Started', url: '/contact' }
          },
          {
            id: 'pro',
            name: 'Pro',
            description: 'For growing businesses',
            price: 29,
            period: 'month',
            currency: 'USD',
            featured: true,
            features: [
              { text: 'Unlimited pages', included: true },
              { text: 'All blocks', included: true },
              { text: 'Priority support', included: true },
              { text: 'Visual editor', included: true },
              { text: 'Custom modules', included: false }
            ],
            cta: { text: 'Start Free Trial', url: '/contact' }
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Custom solutions',
            price: null,
            period: 'month',
            currency: 'USD',
            featured: false,
            features: [
              { text: 'Unlimited pages', included: true },
              { text: 'All blocks', included: true },
              { text: 'Dedicated support', included: true },
              { text: 'Visual editor', included: true },
              { text: 'Custom modules', included: true }
            ],
            cta: { text: 'Contact Sales', url: '/contact' }
          }
        ],
        showComparison: true,
        showToggle: true,
        yearlyDiscount: 20,
        currency: 'USD',
        style: 'cards',
        ctaStyle: 'button',
        highlightFeatured: true,
        showFAQ: false
      }
    },
    contact: {
      enabled: true,
      config: {
        showMap: false,
        mapProvider: 'yandex',
        showForm: true,
        showInfo: true,
        formFields: [
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'message', type: 'textarea', label: 'Message', required: true }
        ],
        notifications: 'email',
        showSocial: true
      }
    },
    blog: {
      enabled: true,
      config: {
        postsPerPage: 10,
        showCategories: true,
        showTags: true,
        showAuthor: true,
        showReadingTime: true,
        showViewCount: false,
        excerptLength: 160,
        layout: 'grid',
        latestPostsCount: 3
      }
    },
    team: {
      enabled: true,
      config: {
        layout: 'grid',
        cardStyle: 'detailed',
        showSocial: true,
        showBio: true,
        showEmail: false,
        showPhone: false,
        groupByDepartment: false,
        columnsDesktop: 4,
        columnsMobile: 2
      }
    },
    testimonials: {
      enabled: true,
      config: {
        layout: 'carousel',
        showRating: true,
        showPhoto: true,
        showCompany: true,
        autoPlay: false,
        autoPlayInterval: 5000
      }
    },
    features: {
      enabled: true,
      config: {
        layout: 'grid',
        cardStyle: 'icon-top',
        showCategory: false,
        columnsDesktop: 3,
        columnsMobile: 1
      }
    },
    clients: {
      enabled: true,
      config: {
        layout: 'strip',
        showNames: false,
        grayscale: true,
        hoverColor: true,
        categories: ['client', 'sponsor', 'partner']
      }
    },
    faq: {
      enabled: true,
      config: {
        layout: 'accordion',
        showCategories: false,
        expandFirst: true,
        allowMultipleOpen: false
      }
    }
  } as ModulesConfig,

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER CONTACT - Quick contact buttons in header (phone + messenger)
  // ═══════════════════════════════════════════════════════════════════════════
  // Best practice: Max 2 buttons - phone + primary messenger for instant contact.
  // Uses setting keys from the settings array below.
  // Only shown if the setting has a value in database.
  // ═══════════════════════════════════════════════════════════════════════════
  headerContact: {
    enabled: true,
    items: ['contact.phone', 'social.telegram'] as const
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
      maxSizeMB: 10, // Max upload size
      maxWidth: 1920, // Resize to max width
      maxHeight: 1080, // Resize to max height
      quality: 85, // WebP quality (1-100)
      thumbnailWidth: 400, // Thumbnail width
      thumbnailHeight: 300, // Thumbnail height
      thumbnailQuality: 75 // Thumbnail WebP quality
    },

    // Video settings
    video: {
      enabled: true, // Allow video uploads
      maxSizeMB: 100, // Max upload size
      maxDurationSeconds: 300, // Max 5 minutes
      allowedTypes: ['mp4', 'webm', 'mov', 'avi'],
      outputFormat: 'mp4' as 'mp4' | 'webm',
      // FFmpeg compression settings
      compression: {
        videoBitrate: '2M', // Target video bitrate
        audioBitrate: '128k', // Target audio bitrate
        maxWidth: 1920, // Scale down if larger
        fps: 30 // Target frame rate
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA SOURCE - Configure where application data comes from
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Provider options:
  //   - 'database': All data from local SQLite (default, zero config)
  //   - 'api': All data from external REST API (requires .env credentials)
  //   - 'hybrid': Per-resource configuration (see resources below)
  //
  // For API provider, set these environment variables in .env:
  //   API_BASE_URL, API_CLIENT_ID, API_CLIENT_SECRET, API_TOKEN_URL
  //
  // Hybrid mode allows mixing sources (e.g., auth in DB, content from API)
  // ═══════════════════════════════════════════════════════════════════════════
  dataSource: {
    // Global provider
    provider: 'database' as 'database' | 'api' | 'hybrid',

    // Per-resource configuration (only used when provider = 'hybrid')
    resources: {
      users: 'database' as 'database' | 'api',
      sessions: 'database' as 'database' | 'api',
      settings: 'database' as 'database' | 'api',
      portfolio: 'database' as 'database' | 'api',
      contacts: 'database' as 'database' | 'api',
      translations: 'database' as 'database' | 'api'
    },

    // API client configuration
    api: {
      timeout: 30000, // Request timeout (ms)

      // Retry with exponential backoff
      retry: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
      },

      // Circuit breaker (prevent cascading failures)
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5, // Open after 5 consecutive failures
        resetTimeout: 60000 // Try again after 60s
      },

      // Response caching (per-resource TTL in seconds)
      cache: {
        enabled: true,
        ttl: {
          users: 300, // 5 min (rarely changes)
          sessions: 60, // 1 min (needs freshness for auth)
          settings: 600, // 10 min (mostly static)
          portfolio: 180, // 3 min (content updates)
          contacts: 0, // No cache (always fresh)
          translations: 3600 // 1 hour (rarely changes)
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTIONS - Website navigation and routing (DRY Architecture)
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // This array controls:
  //   1. Main navigation links (items with inNav: true)
  //   2. Routes handled by [section].vue dynamic page
  //   3. Onepager mode anchor targets (#about, #portfolio, etc.)
  //
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ HOW TO ADD A NEW SECTION (only 3 steps!)                               │
  // ├─────────────────────────────────────────────────────────────────────────┤
  // │ 1. Add entry here:  { id: 'history', inNav: true }                     │
  // │ 2. Create component: app/components/sections/SectionHistory.vue        │
  // │ 3. Add translations: nav.history, history.title, etc.                  │
  // │                                                                         │
  // │ That's it! SectionRenderer handles both onepager and SPA modes.        │
  // │ Component naming: Section{PascalCase(id)} → SectionHistory             │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ SELF-CONTAINED SECTIONS                                                │
  // ├─────────────────────────────────────────────────────────────────────────┤
  // │ Each section component should be self-contained:                       │
  // │   - Fetch its own title from i18n (or use title prop as override)      │
  // │   - Fetch its own content from i18n or API                             │
  // │   - Have sensible defaults for all content                             │
  // │                                                                         │
  // │ Example pattern:                                                        │
  // │   const { t, te } = useI18n()                                          │
  // │   const sectionTitle = computed(() =>                                  │
  // │     te('history.title') ? t('history.title') : 'Our History'           │
  // │   )                                                                    │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ CUSTOM PAGE (not a section)                                            │
  // ├─────────────────────────────────────────────────────────────────────────┤
  // │ Just create the file: app/pages/terms.vue → accessible at /terms       │
  // │ No config changes needed. Link it from footer or elsewhere.            │
  // │ Add to sections array only if you want it in navigation.               │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ ONEPAGER vs SPA MODE                                                   │
  // ├─────────────────────────────────────────────────────────────────────────┤
  // │ Onepager (features.onepager: true):                                    │
  // │   - All sections rendered on index.vue via SectionRenderer             │
  // │   - Nav links are anchors: #about, #portfolio                          │
  // │   - Scrollspy highlights active section                                │
  // │                                                                         │
  // │ SPA mode (features.onepager: false):                                   │
  // │   - Each section is a separate page: /about, /portfolio                │
  // │   - Nav links are routes                                               │
  // │   - [section].vue uses SectionRenderer for dynamic routing             │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  sections: [
    { id: 'home', inNav: true },
    { id: 'about', inNav: true },
    { id: 'portfolio', inNav: true },
    { id: 'features', inNav: true },
    { id: 'team', inNav: true },
    { id: 'testimonials', inNav: true },
    { id: 'blog', inNav: true },
    { id: 'faq', inNav: true },
    { id: 'clients', inNav: true },
    { id: 'pricing', inNav: true },
    { id: 'contact', inNav: true }
  ] as const,

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN SECTIONS - Source of truth for admin panel navigation
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Each section defines:
  //   id      - Route name (maps to /admin/{id})
  //   icon    - Tabler icon name (without 'tabler:' prefix)
  //   label   - i18n key suffix (full key: admin.{label})
  //   badge   - Show unread count badge (e.g., for contacts inbox)
  //   roles   - Array of roles that can access this section (empty = all)
  //             Available roles: 'master', 'admin', 'editor'
  //
  // Usage in admin.vue and AppBottomNav.vue:
  //   const adminSections = config.adminSections.filter(s => canAccess(s.roles))
  // ═══════════════════════════════════════════════════════════════════════════
  adminSections: [
    { id: 'settings', icon: 'settings', label: 'settings', badge: false, roles: [] },
    { id: 'portfolios', icon: 'photo', label: 'portfolio', badge: false, roles: [] },
    { id: 'blog', icon: 'article', label: 'blog', badge: false, roles: [] },
    { id: 'team', icon: 'users-group', label: 'team', badge: false, roles: [] },
    { id: 'features', icon: 'sparkles', label: 'features', badge: false, roles: [] },
    { id: 'testimonials', icon: 'quote', label: 'testimonials', badge: false, roles: [] },
    { id: 'clients', icon: 'building', label: 'clients', badge: false, roles: [] },
    { id: 'faq', icon: 'help-circle', label: 'faq', badge: false, roles: [] },
    { id: 'pricing', icon: 'credit-card', label: 'pricing', badge: false, roles: [] },
    { id: 'contacts', icon: 'mail', label: 'contacts', badge: true, roles: [] },
    { id: 'translations', icon: 'language', label: 'translations', badge: false, roles: [] },
    { id: 'users', icon: 'users', label: 'users', badge: false, roles: ['master', 'admin'] },
    { id: 'health', icon: 'heartbeat', label: 'health', badge: false, roles: ['master'] }
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
      horizontal: 'header', // Full logo for desktop header
      circle: 'short' // Compact logo for sidebar, footer, icons
    },

    // Fallback chain for languages without their own logo
    // If Hebrew logo doesn't exist, use English (not Russian)
    langFallback: {
      he: 'en' // Hebrew → English
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
    black: '#2f2f2f', // Charcoal gray (from logo dark text)
    white: '#f0f0f0', // Off-white (from logo light text)
    brand: '#aa0000', // Dark red/maroon (from logo accent)
    accent: '#0f172a' // Deep slate (for contrast)
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
    {
      key: 'contact.location',
      type: 'string',
      group: 'contact',
      label: 'Location',
      icon: 'map-pin'
    },

    // Social Links (displayed via <SocialNav /> component)
    // Icons: Tabler brand icons (https://tabler.io/icons) or custom-* for custom icons
    // ─── Messaging ───
    {
      key: 'social.telegram',
      type: 'url',
      group: 'social',
      label: 'Telegram',
      icon: 'brand-telegram'
    },
    {
      key: 'social.whatsapp',
      type: 'url',
      group: 'social',
      label: 'WhatsApp',
      icon: 'brand-whatsapp'
    },
    { key: 'social.viber', type: 'url', group: 'social', label: 'Viber', icon: 'brand-viber' },
    {
      key: 'social.discord',
      type: 'url',
      group: 'social',
      label: 'Discord',
      icon: 'brand-discord'
    },
    { key: 'social.max', type: 'url', group: 'social', label: 'MAX Messenger', icon: 'custom-max' },
    // ─── Social Networks ───
    {
      key: 'social.instagram',
      type: 'url',
      group: 'social',
      label: 'Instagram',
      icon: 'brand-instagram'
    },
    {
      key: 'social.facebook',
      type: 'url',
      group: 'social',
      label: 'Facebook',
      icon: 'brand-facebook'
    },
    { key: 'social.twitter', type: 'url', group: 'social', label: 'Twitter/X', icon: 'brand-x' },
    {
      key: 'social.threads',
      type: 'url',
      group: 'social',
      label: 'Threads',
      icon: 'brand-threads'
    },
    { key: 'social.tiktok', type: 'url', group: 'social', label: 'TikTok', icon: 'brand-tiktok' },
    {
      key: 'social.pinterest',
      type: 'url',
      group: 'social',
      label: 'Pinterest',
      icon: 'brand-pinterest'
    },
    { key: 'social.vk', type: 'url', group: 'social', label: 'VK (ВКонтакте)', icon: 'brand-vk' },
    // ─── Video ───
    {
      key: 'social.youtube',
      type: 'url',
      group: 'social',
      label: 'YouTube',
      icon: 'brand-youtube'
    },
    { key: 'social.twitch', type: 'url', group: 'social', label: 'Twitch', icon: 'brand-twitch' },
    // ─── Professional ───
    {
      key: 'social.linkedin',
      type: 'url',
      group: 'social',
      label: 'LinkedIn',
      icon: 'brand-linkedin'
    },
    { key: 'social.medium', type: 'url', group: 'social', label: 'Medium', icon: 'brand-medium' },
    // ─── Dev/Design ───
    { key: 'social.github', type: 'url', group: 'social', label: 'GitHub', icon: 'brand-github' },
    { key: 'social.gitlab', type: 'url', group: 'social', label: 'GitLab', icon: 'brand-gitlab' },
    {
      key: 'social.dribbble',
      type: 'url',
      group: 'social',
      label: 'Dribbble',
      icon: 'brand-dribbble'
    },
    {
      key: 'social.behance',
      type: 'url',
      group: 'social',
      label: 'Behance',
      icon: 'brand-behance'
    },

    // Legal/Juridical Info (displayed in footer small print)
    // Russian: ИНН, ОГРН, Юридический адрес
    {
      key: 'legal.companyName',
      type: 'string',
      group: 'legal',
      label: 'Company Name (for copyright)'
    },
    { key: 'legal.inn', type: 'string', group: 'legal', label: 'ИНН (Tax ID)' },
    { key: 'legal.ogrn', type: 'string', group: 'legal', label: 'ОГРН (Registration Number)' },
    { key: 'legal.address', type: 'string', group: 'legal', label: 'Legal Address' },
    { key: 'legal.email', type: 'email', group: 'legal', label: 'Legal Email' },

    // Footer Settings (CTA text is in translations: cta.footerButton)
    { key: 'footer.ctaUrl', type: 'url', group: 'footer', label: 'CTA Button URL' },
    { key: 'footer.privacyUrl', type: 'url', group: 'footer', label: 'Privacy Policy URL' },
    { key: 'footer.termsUrl', type: 'url', group: 'footer', label: 'Terms of Service URL' },

    // SEO & Meta
    { key: 'seo.title', type: 'string', group: 'seo', label: 'Default Page Title' },
    { key: 'seo.description', type: 'text', group: 'seo', label: 'Meta Description' },
    { key: 'seo.keywords', type: 'string', group: 'seo', label: 'Meta Keywords (comma-separated)' },

    // Analytics (IDs only - scripts injected by plugins)
    {
      key: 'analytics.googleId',
      type: 'string',
      group: 'analytics',
      label: 'Google Analytics ID (G-XXXXXXXX)'
    },
    { key: 'analytics.yandexId', type: 'string', group: 'analytics', label: 'Yandex Metrica ID' },
    {
      key: 'analytics.facebookPixel',
      type: 'string',
      group: 'analytics',
      label: 'Facebook Pixel ID'
    },

    // Verification codes (for webmaster tools)
    {
      key: 'verification.google',
      type: 'string',
      group: 'verification',
      label: 'Google Search Console'
    },
    { key: 'verification.yandex', type: 'string', group: 'verification', label: 'Yandex Webmaster' }
  ] as const,

  // Setting groups (for admin UI organization)
  // Labels are i18n keys - use t(group.label) in templates
  settingGroups: [
    { key: 'contact', label: 'admin.settingsContact', icon: 'address-book' },
    { key: 'social', label: 'admin.settingsSocial', icon: 'share' },
    { key: 'legal', label: 'admin.settingsLegal', icon: 'file-certificate' },
    { key: 'footer', label: 'admin.settingsFooter', icon: 'layout-bottombar' },
    { key: 'seo', label: 'admin.settingsSeo', icon: 'search' },
    { key: 'analytics', label: 'admin.settingsAnalytics', icon: 'chart-bar' },
    { key: 'verification', label: 'admin.settingsVerification', icon: 'certificate' }
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
