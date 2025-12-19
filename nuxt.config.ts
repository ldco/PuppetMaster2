// https://nuxt.com/docs/api/configuration/nuxt-config
import config from './app/puppet-master.config'
import Icons from 'unplugin-icons/vite'
import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // CSS entry point - our custom CSS system
  css: ['~/assets/css/main.css'],

  // App head configuration
  app: {
    head: {
      // Viewport meta - includes viewport-fit=cover for iOS safe-area-inset support
      // Required for PWA and proper bottom nav handling with iOS notch/home indicator
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ],
      // Favicons - generated via `npm run generate:favicons`
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        // Google Fonts - Montserrat (matches logo design)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap'
        }
      ]
    }
  },

  // Modules
  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    // PWA module - conditionally loaded based on config.features.pwa
    ...(config.features.pwa ? ['@vite-pwa/nuxt'] : [])
  ],

  // PWA configuration (only applied when config.features.pwa is true)
  // Uses favicon assets generated via `npm run generate:favicons`
  ...(config.features.pwa ? {
    pwa: {
      registerType: 'autoUpdate',
      manifest: {
        name: 'Puppet Master',
        short_name: 'PM',
        description: 'Puppet Master Application',
        theme_color: config.colors.brand,
        background_color: config.colors.white,
        display: 'standalone',
        icons: [
          {
            src: '/favicon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache static assets
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico,woff,woff2}'],
        // Runtime caching for API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      client: {
        installPrompt: true,
        periodicSyncForUpdates: 3600 // Check for updates every hour
      },
      devOptions: {
        enabled: false, // Disable in dev by default (set true to test PWA locally)
        type: 'module'
      }
    }
  } : {}),

  // Color mode configuration
  // Uses defaultTheme from puppet-master.config.ts
  colorMode: {
    preference: config.defaultTheme,
    fallback: config.defaultTheme === 'system' ? 'light' : config.defaultTheme,
    classSuffix: '',
    storageKey: 'pm-color-mode'
  },

  // i18n configuration
  // NOTE: Translations come from DATABASE via API, not per-locale files!
  // A single loader.ts handles ALL locales - no manual file creation needed
  // Fallbacks in fallbacks.ts provide minimal bootstrap translations
  i18n: {
    // Locales from config - ALL use the same loader.ts file
    locales: config.locales.map(l => ({ ...l, file: 'loader.ts' })),
    langDir: '.', // loader.ts is in i18n/ directory
    defaultLocale: config.defaultLocale,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'pm-i18n-redirected',
      fallbackLocale: config.defaultLocale,
      // alwaysRedirect: false - don't override user's explicit language selection
      // redirectOn: 'root' - only detect on first visit to root path
      alwaysRedirect: false,
      redirectOn: 'root'
    },
    // Bundle options
    bundle: {
      fullInstall: true,
      dropMessageCompiler: false
    },
    // Compilation options
    compilation: {
      strictMessage: false
    },
    // Vue I18n options
    vueI18n: './i18n/i18n.config.ts'
  },

  // PostCSS configuration
  // postcss-preset-env includes autoprefixer + 50+ plugins for modern CSS fallbacks
  postcss: {
    plugins: {
      'postcss-preset-env': {
        // Stage 2 = reasonable stability (default)
        // Stage 3 = more stable, fewer features
        stage: 2,
        // Require 2 browser implementations for extra stability
        minimumVendorImplementations: 2,
        // Enable specific features we use
        features: {
          'custom-media-queries': true,  // @custom-media support
          'nesting-rules': true,         // CSS nesting
          'color-mix': true,             // color-mix() fallbacks
          'custom-properties': true,     // CSS variables fallback for older browsers
        },
        // Autoprefixer options
        autoprefixer: {
          flexbox: 'no-2009',  // Don't generate old flexbox syntax
        },
      }
    }
  },

  // Vite configuration
  vite: {
    plugins: [
      Icons({
        compiler: 'vue3',
        autoInstall: true
      }),
      svgLoader()
    ]
  },

  // Runtime config
  runtimeConfig: {
    // Database
    databaseUrl: process.env.DATABASE_URL || './data/sqlite.db',

    // Email (SMTP)
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '465',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',

    // Telegram Bot
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

    public: {
      features: config.features
    }
  }
})
