/**
 * useSiteSettings Composable
 *
 * Fetches runtime site settings from the API.
 * Settings are cached and can be refreshed on demand.
 *
 * Groups: site, contact, social, seo
 */

export interface SiteSettings {
  contact: {
    email: string | null
    phone: string | null
    location: string | null  // empty=hidden, address text, or "lat,lng" for map
  }
  social: {
    // Messaging
    telegram: string | null
    whatsapp: string | null
    viber: string | null
    discord: string | null
    max: string | null
    // Social networks
    instagram: string | null
    facebook: string | null
    twitter: string | null
    threads: string | null
    tiktok: string | null
    pinterest: string | null
    vk: string | null
    // Video
    youtube: string | null
    twitch: string | null
    // Professional
    linkedin: string | null
    medium: string | null
    // Dev/Design
    github: string | null
    gitlab: string | null
    dribbble: string | null
    behance: string | null
  }
  legal: {
    companyName: string | null  // For copyright: © 2024 {companyName}
    inn: string | null          // ИНН (Tax ID)
    ogrn: string | null         // ОГРН (Registration Number)
    address: string | null      // Legal address
    email: string | null        // Legal email
  }
  footer: {
    ctaText: string | null      // CTA button text
    ctaUrl: string | null       // CTA button URL
    privacyUrl: string | null   // Privacy policy URL
    termsUrl: string | null     // Terms of service URL
  }
  seo: {
    title: string | null        // Page title (also used as site name fallback)
    description: string | null  // SEO description
    keywords: string | null     // Meta keywords
  }
  analytics: {
    googleId: string | null     // Google Analytics ID (G-XXXXXXXX)
    yandexId: string | null     // Yandex Metrica ID
    facebookPixel: string | null // Facebook Pixel ID
  }
  verification: {
    google: string | null       // Google Search Console
    yandex: string | null       // Yandex Webmaster
  }
}

const defaultSettings: SiteSettings = {
  contact: {
    email: null,
    phone: null,
    location: null
  },
  social: {
    // Messaging
    telegram: null,
    whatsapp: null,
    viber: null,
    discord: null,
    max: null,
    // Social networks
    instagram: null,
    facebook: null,
    twitter: null,
    threads: null,
    tiktok: null,
    pinterest: null,
    vk: null,
    // Video
    youtube: null,
    twitch: null,
    // Professional
    linkedin: null,
    medium: null,
    // Dev/Design
    github: null,
    gitlab: null,
    dribbble: null,
    behance: null
  },
  legal: {
    companyName: null,
    inn: null,
    ogrn: null,
    address: null,
    email: null
  },
  footer: {
    ctaText: null,
    ctaUrl: null,
    privacyUrl: null,
    termsUrl: null
  },
  seo: {
    title: null,
    description: null,
    keywords: null
  },
  analytics: {
    googleId: null,
    yandexId: null,
    facebookPixel: null
  },
  verification: {
    google: null,
    yandex: null
  }
}

export function useSiteSettings() {
  // Use Nuxt's data fetching with caching
  const { data, pending, error, refresh } = useFetch<SiteSettings>('/api/settings', {
    key: 'site-settings',
    default: () => defaultSettings,
    transform: (raw: Record<string, Record<string, string | null>>) => {
      // Merge API response with defaults
      return {
        contact: {
          ...defaultSettings.contact,
          ...raw.contact
        },
        social: {
          ...defaultSettings.social,
          ...raw.social
        },
        legal: {
          ...defaultSettings.legal,
          ...raw.legal
        },
        footer: {
          ...defaultSettings.footer,
          ...raw.footer
        },
        seo: {
          ...defaultSettings.seo,
          ...raw.seo
        },
        analytics: {
          ...defaultSettings.analytics,
          ...raw.analytics
        },
        verification: {
          ...defaultSettings.verification,
          ...raw.verification
        }
      }
    }
  })

  // Computed helpers for common use cases
  // Site name: legal.companyName → seo.title → 'Puppet Master'
  const siteName = computed(() =>
    data.value?.legal.companyName || data.value?.seo.title || 'Puppet Master'
  )
  const contactEmail = computed(() => data.value?.contact.email)
  const contactPhone = computed(() => data.value?.contact.phone)

  // Social links as array for iteration
  const socialLinks = computed(() => {
    const social = data.value?.social || {}
    return Object.entries(social)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => ({ platform, url: url as string }))
  })

  // SEO meta
  const seoTitle = computed(() => data.value?.seo.title || siteName.value)
  const seoDescription = computed(() => data.value?.seo.description)

  return {
    // Raw data
    settings: data,
    isLoading: pending,
    error,
    refresh,

    // Helpers
    siteName,
    contactEmail,
    contactPhone,
    socialLinks,
    seoTitle,
    seoDescription
  }
}

